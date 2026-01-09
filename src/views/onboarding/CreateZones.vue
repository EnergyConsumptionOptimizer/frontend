<script setup>
import { computed, onBeforeMount, onMounted, watch } from "vue";
import { useConfirm, useToast } from "primevue";

import InteractiveMapLayout from "@/layout/InteractiveMapLayout.vue";
import OnboardingStepLayout from "@/layout/OnboardingStepLayout.vue";

import InteractiveMap from "@/components/InteractiveMap.vue";
import Zone from "@/components/interactiveMap/Zone.vue";
import SmartFurnitureHookup from "@/components/interactiveMap/SmartFurnitureHookup.vue";
import IncompletePolygon from "@/components/interactiveMap/IncompletePolygon.vue";
import FloorPlanTreeSidebar from "@/components/interactiveMap/FloorPlanTreeSidebar.vue";
import MapEditorActionButtons from "@/components/interactiveMap/MapEditorActionButtons.vue";
import ZoneInformationDialog from "@/components/interactiveMap/ZoneInformationDialog.vue";

import { useOnboardingStore } from "@/stores/onboarding";
import { useInteractiveMap } from "@/stores/interactiveMap";

import { useZoneEditor } from "@/composables/interactiveMap/useZoneEditor.js";
import { useZoneDrag } from "@/composables/interactiveMap/useZoneDrag.js";
import { useZoneCollision } from "@/composables/interactiveMap/useZoneCollision.js";
import { computeFloorPlanTree } from "@/utils/floorPlanTree.js";
import { deleteZoneDialog } from "@/utils/ui/deleteZoneDialog.js";
import { collisionZoneToast } from "@/utils/ui/collisionZoneToast.js";
import { deleteZoneToast } from "@/utils/ui/deleteZoneToast.js";

const onboardingStore = useOnboardingStore();
const mapStore = useInteractiveMap();

const confirm = useConfirm();
const toast = useToast();

const existingZones = computed(() => mapStore.zones);
const existingSmartFurnitureHookups = computed(
  () => mapStore.smartFurnitureHookups,
);

const tree = computed(() =>
  computeFloorPlanTree(mapStore.zones, mapStore.smartFurnitureHookups),
);

const {
  draftZone,
  colorInput,
  isPolygonClosed,
  polygonPath,
  displayColor,
  collisionError,
  zoneDialog,

  startDrawing,
  stopDrawing,
  addPoint,
  finalizeZone,
  doneEditingZone,
  loadZoneForEdit,
  goToSetup,
  isZoneOnDrawMode,
  isZoneOnEditMode,
  hideZoneDialog,
} = useZoneEditor(existingZones);

const { startDragZone, startDragVertex, handleDragMove, stopDrag } =
  useZoneDrag(existingZones, existingSmartFurnitureHookups);

const collision = useZoneCollision();

const cursorStyle = computed(() => {
  if (mapStore.isDrawMode && !isPolygonClosed.value) {
    return "cursor-crosshair";
  }
  return "cursor-default";
});

function handleStartDrawing() {
  mapStore.startDrawing();
  startDrawing();
}

function handleStopDrawing() {
  mapStore.viewMap();
  stopDrawing();
}

function handleInteractiveMapClick(point) {
  if (mapStore.isDrawMode) {
    addPoint(point);
  }
}

function handleSaveZone() {
  const name = draftZone.value.name.trim();

  if (!name) {
    return;
  }

  if (isZoneOnDrawMode.value) {
    const newZone = finalizeZone();
    mapStore.addZone(newZone);

    for (const sfh of existingSmartFurnitureHookups.value) {
      if (collision.isPointInPolygon(sfh.position, newZone.points)) {
        sfh.zone = newZone.id;
      }
    }
  } else if (isZoneOnEditMode.value) {
    mapStore.updateZone(draftZone.value.id, {
      name: name,
      color: displayColor.value,
    });

    doneEditingZone();
  }
}

function handleEditZone(zoneId) {
  if (mapStore.isDrawMode) {
    handleStopDrawing();
  }

  const zone = mapStore.findZone(zoneId);

  if (!zone) return;

  loadZoneForEdit(zone);
}

function handleStartEditing() {
  mapStore.startEditing();
}

function handleStopEditing() {
  mapStore.viewMap();
}

function handleDeleteZone(zoneId) {
  confirm.require(
    deleteZoneDialog(() => {
      mapStore.deleteZone(zoneId);

      toast.add(deleteZoneToast);
    }),
  );
}

watch(collisionError, (error) => {
  if (error) {
    toast.add(collisionZoneToast(error));
  }
  collisionError.value = null;
});

onBeforeMount(() => {
  mapStore.viewMap();
});

onMounted(() => {
  onboardingStore.completeStep();
});
</script>

<template>
  <onboarding-step-layout
    title="Create zones"
    subtitle="Draw polygons on the floor plan to create new zones"
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
                label="Create new zone"
                icon="pi pi-plus"
                severity="success"
                @click="handleStartDrawing"
              />
              <Button
                label="Edit zones"
                severity="secondary"
                icon="pi pi-arrows-alt"
                :disabled="!mapStore.hasZones"
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
                v-if="isZoneOnDrawMode && isPolygonClosed"
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
            :floor-plan-svg="mapStore.svgData"
            :cursor="cursorStyle"
            @interactiveMapClick="handleInteractiveMapClick"
            @interactiveMapMouseMove="handleDragMove"
            @mouseup="stopDrag"
            @mouseleave="stopDrag"
          >
            <template #zones>
              <g v-if="mapStore.isDrawMode && isZoneOnDrawMode">
                <incomplete-polygon
                  v-if="!isPolygonClosed"
                  :points="draftZone.points"
                  :color="displayColor"
                  :polygonPath="polygonPath"
                />
                <zone
                  v-if="isPolygonClosed"
                  :zone="draftZone"
                  :editModeActive="isPolygonClosed"
                  @zoneClick="startDragZone"
                  @zoneVerticeClick="startDragVertex"
                />
              </g>

              <zone
                v-for="zone in mapStore.zones"
                :key="zone.id"
                :zone="zone"
                :editModeActive="mapStore.isEditMode"
                @zoneClick="startDragZone"
                @zoneVerticeClick="startDragVertex"
              />
            </template>

            <template #hookups>
              <smart-furniture-hookup
                v-for="sfh in mapStore.smartFurnitureHookups"
                :key="sfh.id"
                :editModeActive="false"
                :smartFurnitureHookup="sfh"
              />
            </template>
          </interactive-map>
        </template>
        <template #sidebar>
          <floor-plan-tree-sidebar
            :tree="tree"
            :hasZones="mapStore.hasZones"
            :hasZoneActions="true"
            :disableActionsZone="mapStore.isDrawMode"
            @editZone="handleEditZone"
            @deleteZone="handleDeleteZone"
          />
        </template>
      </interactive-map-layout>
    </template>
    <template #dialogs>
      <zone-information-dialog
        :isOnDrawMode="isZoneOnDrawMode"
        v-model:visible="zoneDialog"
        v-model:colorInput="colorInput"
        v-model:zone="draftZone"
        @hide="hideZoneDialog"
        @cancel="hideZoneDialog"
        @save="handleSaveZone"
      />
    </template>
  </onboarding-step-layout>
</template>

<style scoped></style>
