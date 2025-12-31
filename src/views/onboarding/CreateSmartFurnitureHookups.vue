<script setup>
import { computed, onBeforeMount, ref } from "vue";
import axios from "axios";
import { useConfirm, useToast } from "primevue";

import InteractiveMapLayout from "@/layout/InteractiveMapLayout.vue";
import OnboardingStepLayout from "@/layout/OnboardingStepLayout.vue";

import InteractiveMap from "@/components/InteractiveMap.vue";
import Zone from "@/components/interactiveMap/Zone.vue";
import SmartFurnitureHookup from "@/components/interactiveMap/SmartFurnitureHookup.vue";
import FloorPlanTreeSidebar from "@/components/interactiveMap/FloorPlanTreeSidebar.vue";
import MapEditorActionButtons from "@/components/interactiveMap/MapEditorActionButtons.vue";
import SmartFurnitureHookupInformationDialog from "@/components/interactiveMap/SmartFurnitureHookupInformationDialog.vue";

import { useOnboardingStore } from "@/stores/onboarding";
import { useInteractiveMap } from "@/stores/interactiveMap";

import { useSmartFurnitureHookupEditor } from "@/composables/interactiveMap/useSmartFurnitureHookupEditor.js";
import { useSmartFurnitureHookupZoneDetection } from "@/composables/interactiveMap/useSmartFurnitureHookupZoneDetection.js";
import { useSmartFurnitureHookupDrag } from "@/composables/interactiveMap/useSmartFurnitureHookupDrag.js";

import { computeFloorPlanTree } from "@/utils/floorPlanTree.js";
import { deleteSmartFurnitureHookupTost } from "@/utils/deleteSmartFurnitureHookupTost.js";
import { cannotFetchSmartFurnitureHookupInfoToast } from "@/utils/cannotFetchSmartFurnitureHookupInfoToast.js";
import { deleteSmartFurnitureHookupDialog } from "@/utils/deleteSmartFurnitureHookupDialog.js";

const onboardingStore = useOnboardingStore();
const mapStore = useInteractiveMap();

const confirm = useConfirm();
const toast = useToast();

const endpointLoading = ref(false);

const existingZones = computed(() => mapStore.zones);

const tree = computed(() =>
  computeFloorPlanTree(mapStore.zones, mapStore.smartFurnitureHookups),
);

const cursorStyle = computed(() => {
  if (mapStore.isDrawMode && !isPositioned.value) {
    return "cursor-crosshair";
  }
  return "cursor-default";
});

const {
  draftSmartFurnitureHookup,
  isPositioned,
  smartFurnitureHookupDialog,

  isSmartFurnitureHookupOnDrawMode,
  isSmartFurnitureHookupOnEditMode,

  startDrawing,
  stopDrawing,
  positionSmartFurnitureHookup,
  finalizeSmartFurnitureHookup,
  goToSetup,
  loadSmartFurnitureHookupForEdit,
  doneEditingSmartFurnitureHookup,
  hideSmartFurnitureHookupDialog,
} = useSmartFurnitureHookupEditor();

const { startDragSmartFurnitureHookup, handleDragMove, stopDrag } =
  useSmartFurnitureHookupDrag(existingZones);

const { findZoneForSmartFurnitureHookup } =
  useSmartFurnitureHookupZoneDetection(existingZones);

function handleStartDrawing() {
  mapStore.startDrawing();
  startDrawing();
}

function handleStopDrawing() {
  mapStore.viewMap();
  stopDrawing();
}

function handleFloorPlanClick(point) {
  if (mapStore.isDrawMode) {
    positionSmartFurnitureHookup(point);
  }
}

async function fetchSmartFurnitureHookupInfo() {
  endpointLoading.value = true;
  try {
    const response = await axios.get(draftSmartFurnitureHookup.value.endpoint);

    console.log(response);

    if (response.data < 1) {
      toast.add(cannotFetchSmartFurnitureHookupInfoToast);
      return;
    }

    draftSmartFurnitureHookup.value.name = response.data.name;
    draftSmartFurnitureHookup.value.utilityType = response.data.node_type;
  } catch (error) {
    toast.add(cannotFetchSmartFurnitureHookupInfoToast);
  } finally {
    endpointLoading.value = false;
  }
}

function handleSaveSmartFurnitureHookup() {
  const name = draftSmartFurnitureHookup.value.name.trim();
  const endpoint = draftSmartFurnitureHookup.value.endpoint.trim();
  const utilityType = draftSmartFurnitureHookup.value.utilityType;

  if (!name || !endpoint || !utilityType) {
    return;
  }

  if (isSmartFurnitureHookupOnDrawMode.value) {
    const newSmartFurnitureHookup = finalizeSmartFurnitureHookup();

    newSmartFurnitureHookup.zone = findZoneForSmartFurnitureHookup(
      newSmartFurnitureHookup,
    );

    mapStore.addSmartFurnitureHookup(newSmartFurnitureHookup);

    if (mapStore.smartFurnitureHookupsCount === 1) {
      onboardingStore.completeStep();
    }
  } else if (isSmartFurnitureHookupOnEditMode.value) {
    mapStore.updateSmartFurnitureHookup(draftSmartFurnitureHookup.value.id, {
      name: name,
      endpoint: draftSmartFurnitureHookup.value.endpoint,
      utilityType: draftSmartFurnitureHookup.value.utilityType,
    });

    doneEditingSmartFurnitureHookup();
  }
}

function handleStartEditing() {
  mapStore.startEditing();
}

function handleStopEditing() {
  mapStore.viewMap();
}

function handleEditSmartFurnitureHookup(smartFurnitureHookupId) {
  if (mapStore.isDrawMode) {
    handleStopDrawing();
  }

  const smartFurnitureHookup = mapStore.findSmartFurnitureHookup(
    smartFurnitureHookupId,
  );

  if (!smartFurnitureHookup) return;

  loadSmartFurnitureHookupForEdit(smartFurnitureHookup);
}

function handleDeleteSmartFurnitureHookup(smartFurnitureHookupId) {
  confirm.require(
    deleteSmartFurnitureHookupDialog(() => {
      mapStore.deleteSmartFurnitureHookup(smartFurnitureHookupId);

      if (mapStore.smartFurnitureHookupsCount === 0) {
        onboardingStore.uncompleteStep();
      }

      toast.add(deleteSmartFurnitureHookupTost);
    }),
  );
}

onBeforeMount(() => {
  mapStore.viewMap();
});
</script>

<template>
  <onboarding-step-layout
    title="Create smart furniture hookups"
    subtitle="Create smart furniture hookups and position them on the floor plan"
  >
    <template #content>
      <interactive-map-layout>
        <template #actions>
          <map-editor-action-buttons
            :isViewMode="mapStore.isViewMode"
            :isDrawMode="mapStore.isDrawMode"
            :isEditMode="mapStore.isEditMode"
          >
            <template #viewActions>
              <Button
                label="Create new hookup"
                severity="success"
                icon="pi pi-plus"
                @click="handleStartDrawing"
              />
              <Button
                label="Edit hookups"
                severity="secondary"
                icon="pi pi-arrows-alt"
                :disabled="!mapStore.hasSmartFurnitureHookups"
                @click="handleStartEditing"
              />
            </template>
            <template #drawActions>
              <Button
                label="Back"
                severity="secondary"
                @click="handleStopDrawing"
              />
              <Button
                v-if="isSmartFurnitureHookupOnDrawMode && isPositioned"
                label="Continue to setup"
                severity="success"
                @click="goToSetup"
              />
            </template>
            <template #editActions>
              <Button
                label="Done Editing"
                severity="success"
                @click="handleStopEditing"
              />
            </template>
          </map-editor-action-buttons>
        </template>
        <template #floor-plan>
          <interactive-map
            :floor-plan-svg="mapStore.svgDataUrl"
            :cursor="cursorStyle"
            @interactiveMapClick="handleFloorPlanClick"
            @interactiveMapMouseMove="handleDragMove"
            @mouseup="stopDrag"
            @mouseleave="stopDrag"
          >
            <template #zones>
              <zone
                v-for="zone in mapStore.zones"
                :key="zone.id"
                :zone="zone"
                :editModeActive="false"
              />
            </template>

            <template #hookups>
              <smart-furniture-hookup
                @smartFurnitureHookupClick="startDragSmartFurnitureHookup"
                v-if="
                  mapStore.isDrawMode &&
                  isSmartFurnitureHookupOnDrawMode &&
                  isPositioned
                "
                :smartFurnitureHookup="draftSmartFurnitureHookup"
                :editModeActive="true"
              />

              <smart-furniture-hookup
                v-for="sfh in mapStore.smartFurnitureHookups"
                :key="sfh.id"
                :editModeActive="mapStore.isEditMode"
                @smartFurnitureHookupClick="startDragSmartFurnitureHookup"
                :smartFurnitureHookup="sfh"
              />
            </template>
          </interactive-map>
        </template>
        <template #sidebar>
          <floor-plan-tree-sidebar
            :tree="tree"
            :hasZones="mapStore.hasZones"
            :hasSmartFurnitureHookupActions="true"
            :disableActionsSmartFurnitureHookup="mapStore.isDrawMode"
            @editSmartFurnitureHookup="handleEditSmartFurnitureHookup"
            @deleteSmartFurnitureHookup="handleDeleteSmartFurnitureHookup"
          />
        </template>
      </interactive-map-layout>
    </template>
    <template #dialogs>
      <smart-furniture-hookup-information-dialog
        :isOnDrawMode="isSmartFurnitureHookupOnDrawMode"
        v-model:visible="smartFurnitureHookupDialog"
        v-model:loading="endpointLoading"
        v-model:smartFurnitureHookup="draftSmartFurnitureHookup"
        @save="handleSaveSmartFurnitureHookup"
        @hide="hideSmartFurnitureHookupDialog"
        @cancel="hideSmartFurnitureHookupDialog"
        @fetchInfo="fetchSmartFurnitureHookupInfo"
      />
      <ConfirmDialog />
      <Toast />
    </template>
  </onboarding-step-layout>
</template>

<style scoped></style>
