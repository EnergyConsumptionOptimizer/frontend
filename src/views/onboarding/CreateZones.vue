<script setup>
import { computed, onBeforeMount, onMounted, watch } from "vue";
import { useConfirm, useToast } from "primevue";

import InteractiveMapEditorLayout from "@/layout/InteractiveMapEditorLayout.vue";
import OnboardingStepLayout from "@/layout/OnboardingStepLayout.vue";
import Zone from "@/components/interactiveMap/Zone.vue";
import SmartFurnitureHookup from "@/components/interactiveMap/SmartFurnitureHookup.vue";
import IncompletePolygon from "@/components/interactiveMap/IncompletePolygon.vue";
import FloorPlanTreeSidebar from "@/components/interactiveMap/FloorPlanTreeSidebar.vue";
import MapEditorActionButtons from "@/components/interactiveMap/MapEditorActionButtons.vue";
import ZoneInformationDialog from "@/components/interactiveMap/ZoneInformationDialog.vue";

import { useOnboardingStore } from "@/stores/onboarding";

import { useZoneEditor } from "@/composables/interactiveMap/useZoneEditor.js";
import { useZoneDrag } from "@/composables/interactiveMap/useZoneDrag.js";
import { useZoneCollision } from "@/composables/interactiveMap/useZoneCollision.js";
import { computeFloorPlanTree } from "@/utils/floorPlanTree.js";
import { deleteZoneDialog } from "@/utils/ui/deleteZoneDialog.js";
import { collisionZoneToast } from "@/utils/ui/collisionZoneToast.js";
import { deleteZoneToast } from "@/utils/ui/deleteZoneToast.js";
import InteractiveMapLayout from "@/layout/InteractiveMapLayout.vue";
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";

const onboardingStore = useOnboardingStore();
const interactiveMapStore = useInteractiveMapStore();

const confirm = useConfirm();
const toast = useToast();

const existingZones = computed(() => interactiveMapStore.zones);
const existingSmartFurnitureHookups = computed(
  () => interactiveMapStore.smartFurnitureHookups,
);

const tree = computed(() =>
  computeFloorPlanTree(
    interactiveMapStore.zones,
    interactiveMapStore.smartFurnitureHookups,
  ),
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

const { dragState, startDragZone, startDragVertex, handleDragMove, stopDrag } =
  useZoneDrag(existingZones, existingSmartFurnitureHookups);

const collision = useZoneCollision();

const cursorStyle = computed(() => {
  if (interactiveMapStore.isDrawMode && !isPolygonClosed.value) {
    return "cursor-crosshair";
  }
  return "cursor-default";
});

function handleStartDrawing() {
  interactiveMapStore.startDrawing();
  startDrawing();
}

function handleStopDrawing() {
  interactiveMapStore.viewMap();
  stopDrawing();
}

function handleInteractiveMapClick(point) {
  if (interactiveMapStore.isDrawMode) {
    addPoint(point);
  }
}

async function handleSaveZone() {
  const name = draftZone.value.name.trim();

  if (!name) {
    return;
  }

  if (isZoneOnDrawMode.value) {
    const newZone = finalizeZone();
    await interactiveMapStore.addZone(newZone);

    for (const sfh of interactiveMapStore.smartFurnitureHookups) {
      if (collision.isPointInPolygon(sfh.position, newZone.points)) {
        sfh.zone = newZone.id;
      }
    }
  } else if (isZoneOnEditMode.value) {
    await interactiveMapStore.updateZone(draftZone.value.id, {
      name: name,
      color: displayColor.value,
    });

    doneEditingZone();
  }
}

async function handleEditZone(zoneId) {
  if (interactiveMapStore.isDrawMode) {
    handleStopDrawing();
  }

  const zone = await interactiveMapStore.findZone(zoneId);

  if (!zone) return;

  loadZoneForEdit(zone);
}

async function handleStopZoneDrag() {
  if (!dragState.value.isDragging) return;

  const draggedZone = stopDrag();

  if (!draggedZone.id) return;

  await interactiveMapStore.updateZonePosition(draggedZone.id, {
    points: draggedZone.points,
  });
}

function handleStartEditing() {
  interactiveMapStore.startEditing();
}

function handleStopEditing() {
  interactiveMapStore.viewMap();
}

function handleDeleteZone(zoneId) {
  confirm.require(
    deleteZoneDialog(async () => {
      await interactiveMapStore.deleteZone(zoneId);

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
  interactiveMapStore.viewMap();
});

onMounted(() => {
  onboardingStore.completeStep();
  interactiveMapStore.viewMap();
  interactiveMapStore.setLocalMode(true);
});
</script>

<template>
  <onboarding-step-layout
    title="Create zones"
    subtitle="Draw polygons on the floor plan to create new zones"
  >
    <template #content>
      <interactive-map-editor-layout>
        <template #actions>
          <map-editor-action-buttons
            :isViewMode="interactiveMapStore.isViewMode"
            :isDrawMode="interactiveMapStore.isDrawMode"
            :isEditMode="interactiveMapStore.isEditMode"
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
                :disabled="!interactiveMapStore.hasZones"
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
          <interactive-map-layout
            :floor-plan-svg="interactiveMapStore.svgData"
            :cursor="cursorStyle"
            @interactiveMapClick="handleInteractiveMapClick"
            @interactiveMapMouseMove="handleDragMove"
            @mouseup="handleStopZoneDrag"
            @mouseleave="handleStopZoneDrag"
          >
            <template #zones>
              <g v-if="interactiveMapStore.isDrawMode && isZoneOnDrawMode">
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
                v-for="zone in interactiveMapStore.zones"
                :key="zone.id"
                :zone="zone"
                :editModeActive="interactiveMapStore.isEditMode"
                @zoneClick="startDragZone"
                @zoneVerticeClick="startDragVertex"
              />
            </template>

            <template #hookups>
              <smart-furniture-hookup
                v-for="sfh in interactiveMapStore.smartFurnitureHookups"
                :key="sfh.id"
                :editModeActive="false"
                :smartFurnitureHookup="sfh"
              />
            </template>
          </interactive-map-layout>
        </template>
        <template #sidebar>
          <floor-plan-tree-sidebar
            :tree="tree"
            :hasZones="interactiveMapStore.hasZones"
            :hasZoneActions="true"
            :disableActionsZone="interactiveMapStore.isDrawMode"
            @editZone="handleEditZone"
            @deleteZone="handleDeleteZone"
          />
        </template>
      </interactive-map-editor-layout>
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
