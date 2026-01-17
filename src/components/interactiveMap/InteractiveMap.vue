<script setup>
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";

import { useZoneEditor } from "@/composables/interactiveMap/useZoneEditor.js";
import { useZoneDrag } from "@/composables/interactiveMap/useZoneDrag.js";
import { useSmartFurnitureHookupEditor } from "@/composables/interactiveMap/useSmartFurnitureHookupEditor.js";
import { useSmartFurnitureHookupDrag } from "@/composables/interactiveMap/useSmartFurnitureHookupDrag.js";
import { useSmartFurnitureHookupZoneDetection } from "@/composables/interactiveMap/useSmartFurnitureHookupZoneDetection.js";
import { computeFloorPlanTree } from "@/utils/floorPlanTree.js";

import InteractiveMapEditorLayout from "@/layout/InteractiveMapEditorLayout.vue";
import InteractiveMapLayout from "@/layout/InteractiveMapLayout.vue";
import MapEditorActionButtons from "@/components/interactiveMap/MapEditorActionButtons.vue";
import FloorPlanTreeSidebar from "@/components/interactiveMap/FloorPlanTreeSidebar.vue";
import Zone from "@/components/interactiveMap/Zone.vue";
import IncompletePolygon from "@/components/interactiveMap/IncompletePolygon.vue";
import SmartFurnitureHookup from "@/components/interactiveMap/SmartFurnitureHookup.vue";
import ZoneInformationDialog from "@/components/interactiveMap/ZoneInformationDialog.vue";
import SmartFurnitureHookupInformationDialog from "@/components/interactiveMap/SmartFurnitureHookupInformationDialog.vue";

import { useConfirm, useToast } from "primevue";
import { deleteZoneDialog } from "@/utils/ui/deleteZoneDialog.js";
import { deleteZoneToast } from "@/utils/ui/deleteZoneToast.js";
import { collisionZoneToast } from "@/utils/ui/collisionZoneToast.js";
import { cannotFetchSmartFurnitureHookupInfoToast } from "@/utils/ui/cannotFetchSmartFurnitureHookupInfoToast.js";
import { deleteSmartFurnitureHookupDialog } from "@/utils/ui/deleteSmartFurnitureHookupDialog.js";
import { deleteSmartFurnitureHookupTost } from "@/utils/ui/deleteSmartFurnitureHookupTost.js";
import { useAsyncAction } from "@/composables/utils/asyncAction";
import { SmartFurnitureHookupService } from "@/service/SmartFurnitureService";

const props = defineProps({
  isLocalMode: { type: Boolean, default: false },
  manageZones: { type: Boolean, default: true },
  manageSmartFurnitureHookups: { type: Boolean, default: true },
});

const emit = defineEmits([
  "zone-created",
  "zone-deleted",
  "smart-furniture-hookup-created",
  "smart-furniture-hookup-deleted",
]);

const interactiveMapStore = useInteractiveMapStore();
const {
  zones,
  smartFurnitureHookups,
  svgData,
  isViewMode,
  isDrawMode,
  isEditMode,
  hasZones,
} = storeToRefs(interactiveMapStore);

const drawingType = ref(null);
const confirm = useConfirm();
const toast = useToast();
const { isLoading: endpointLoading, perform: performEndpointCheck } =
  useAsyncAction();

const {
  draftZone,
  isPolygonClosed,
  polygonPath,
  displayColor,
  collisionError,
  zoneDialog,
  startDrawing: startDrawingZone,
  stopDrawing: stopDrawingZone,
  addPoint,
  doneDrawing: doneDrawingZone,
  doneEditingZone,
  loadZoneForEdit,
  goToSetup: goToZoneSetup,
  isZoneOnDrawMode,
  isZoneOnEditMode,
  hideZoneDialog,
} = useZoneEditor(zones);

const {
  dragState: zonedDagState,
  startDragZone,
  startDragVertex,
  handleDragMove: handleZoneDragMove,
  stopDrag: stopZoneDrag,
} = useZoneDrag(zones, smartFurnitureHookups);

const {
  draftSmartFurnitureHookup,
  isPositioned: isSmartFurnitureHookupPositioned,
  smartFurnitureHookupDialog,
  isSmartFurnitureHookupOnDrawMode,
  isSmartFurnitureHookupOnEditMode,
  isSmartFurnitureHookupEndpointConfigured,
  startDrawing: startDrawingSmartFurnitureHookup,
  stopDrawing: stopDrawingSmartFurnitureHookup,
  positionSmartFurnitureHookup,
  doneDrawing: doneDrawingSmartFurnitureHookup,
  goToSetup: goToSmartFurnitureHookupSetup,
  loadSmartFurnitureHookupForEdit,
  doneEditingSmartFurnitureHookup,
  hideSmartFurnitureHookupDialog,
} = useSmartFurnitureHookupEditor();

const {
  startDragSmartFurnitureHookup,
  handleDragMove: handleSmartFurnitureHookupDragMove,
  stopDrag: stopSmartFurnitureHookupDrag,
  dragState: smartFurnitureHookupDragState,
} = useSmartFurnitureHookupDrag(zones);

const { findZoneForSmartFurnitureHookup } =
  useSmartFurnitureHookupZoneDetection(zones);

const tree = computed(() =>
  computeFloorPlanTree(zones.value, smartFurnitureHookups.value),
);

const cursorStyle = computed(() => {
  if (
    isDrawMode.value &&
    (!isPolygonClosed.value || !isSmartFurnitureHookupPositioned.value)
  ) {
    return "cursor-crosshair";
  }
  return "cursor-default";
});

function handleStartDrawingZone() {
  interactiveMapStore.startDrawing();
  startDrawingZone();
  drawingType.value = "zone";
}

function handleStartDrawingSmartFurnitureHookup() {
  interactiveMapStore.startDrawing();
  startDrawingSmartFurnitureHookup();
  drawingType.value = "smart-furniture-hookup";
}

function handleStopDrawing() {
  interactiveMapStore.viewMap();
  if (drawingType.value === "zone") stopDrawingZone();
  if (drawingType.value === "smart-furniture-hookup")
    stopDrawingSmartFurnitureHookup();
  drawingType.value = null;
}

function handleStartEditing() {
  interactiveMapStore.startEditing();
}

function handleStopEditing() {
  interactiveMapStore.viewMap();
}

async function handleSaveZone(zoneInfo) {
  if (isZoneOnDrawMode.value) {
    await interactiveMapStore.addZone({
      ...draftZone.value,
      zoneInfo,
    });
    doneDrawingZone();
    emit("zone-created", zones.value.length);
  } else if (isZoneOnEditMode.value) {
    await interactiveMapStore.updateZone(draftZone.value.id, {
      name: zoneInfo.name,
      color: zoneInfo.color,
    });
    doneEditingZone();
  }
}

async function fetchAndConfigSmartFurnitureHookupInfo() {
  const success = await performEndpointCheck(async () => {
    const response =
      await SmartFurnitureHookupService.fetchExternalEndpointInfo(
        draftSmartFurnitureHookup.value.endpoint,
      );
    if (
      !response.data ||
      !(
        response.data.name ||
        response.data.utilityType ||
        response.data.node_type
      )
    ) {
      throw new Error("Invalid response format");
    }

    isSmartFurnitureHookupEndpointConfigured.value = true;
    if (!draftSmartFurnitureHookup.value.name) {
      draftSmartFurnitureHookup.value.name = response.data.name;
    }
    draftSmartFurnitureHookup.value.utilityType =
      response.data.node_type || response.data.utilityType;
  });

  if (!success) {
    toast.add(cannotFetchSmartFurnitureHookupInfoToast);
  }
  return success;
}

async function handleSaveSmartFurnitureHookup(smartFurnitureHookupInfo) {
  if (
    !isSmartFurnitureHookupEndpointConfigured.value &&
    !draftSmartFurnitureHookup.value.utilityType
  ) {
    const success = await fetchAndConfigSmartFurnitureHookupInfo();
    if (!success) return;
  }

  if (isSmartFurnitureHookupOnDrawMode.value) {
    const zone = findZoneForSmartFurnitureHookup(
      draftSmartFurnitureHookup.value,
    );

    await interactiveMapStore.addSmartFurnitureHookup({
      ...draftSmartFurnitureHookup.value,
      smartFurnitureHookupInfo,
      zone,
    });
    doneDrawingSmartFurnitureHookup();
    emit("smart-furniture-hookup-created", smartFurnitureHookups.value.length);
  } else if (isSmartFurnitureHookupOnEditMode.value) {
    await interactiveMapStore.updateSmartFurnitureHookup(
      draftSmartFurnitureHookup.value.id,
      {
        name: smartFurnitureHookupInfo.name,
        endpoint: smartFurnitureHookupInfo.endpoint,
        utilityType: smartFurnitureHookupInfo.utilityType,
      },
    );
    doneEditingSmartFurnitureHookup();
  }
}

async function handleEditZone(zoneId) {
  if (isDrawMode.value) handleStopDrawing();
  const zone = await interactiveMapStore.findZone(zoneId);
  if (zone) loadZoneForEdit(zone);
}

function handleDeleteZone(zoneId) {
  confirm.require(
    deleteZoneDialog(async () => {
      await interactiveMapStore.deleteZone(zoneId);
      emit("zone-deleted", zones.value.length);
      toast.add(deleteZoneToast);
    }),
  );
}

async function handleEditSmartFurnitureHookup(id) {
  if (isDrawMode.value) handleStopDrawing();
  const hookup = await interactiveMapStore.findSmartFurnitureHookup(id);
  if (hookup) loadSmartFurnitureHookupForEdit(hookup);
}

async function handleDeleteSmartFurnitureHookup(id) {
  confirm.require(
    deleteSmartFurnitureHookupDialog(async () => {
      await interactiveMapStore.deleteSmartFurnitureHookup(id);
      emit(
        "smart-furniture-hookup-deleted",
        smartFurnitureHookups.value.length,
      );
      toast.add(deleteSmartFurnitureHookupTost);
    }),
  );
}

function handleInteractiveMapClick(point) {
  if (!isDrawMode.value) return;

  if (drawingType.value === "zone" && props.manageZones) {
    addPoint(point);
  } else if (
    drawingType.value === "smart-furniture-hookup" &&
    props.manageSmartFurnitureHookups
  ) {
    positionSmartFurnitureHookup(point);
  }
}

function handleStartDragZone(zone, position) {
  if (props.manageZones) startDragZone(zone, position);
}

function handleStartDragVertex(zone, vertexIndex, position) {
  if (props.manageZones) startDragVertex(zone, vertexIndex, position);
}

function handleStartDragSmartFurnitureHookup(sfh, position) {
  if (props.manageSmartFurnitureHookups)
    startDragSmartFurnitureHookup(sfh, position);
}

function handleDragMove(event) {
  handleZoneDragMove(event);
  handleSmartFurnitureHookupDragMove(event);
}

async function handleStopDrag() {
  if (zonedDagState.value.isDragging) await handleStopZoneDrag();
  if (smartFurnitureHookupDragState.value.isDragging)
    await handleStopSmartFurnitureHookupDrag();
}

async function handleStopZoneDrag() {
  const draggedZone = stopZoneDrag();
  if (!draggedZone.id) return;
  await interactiveMapStore.updateZonePosition(draggedZone.id, {
    points: draggedZone.points,
  });
}

async function handleStopSmartFurnitureHookupDrag() {
  const dragged = stopSmartFurnitureHookupDrag();
  if (!dragged.id) return;
  await interactiveMapStore.updateSmartFurnitureHookup(dragged.id, {
    position: dragged.position,
    zone: dragged.zone,
  });
}

watch(collisionError, (error) => {
  if (error) {
    toast.add(collisionZoneToast(error));
    collisionError.value = null;
  }
});

onBeforeMount(() => interactiveMapStore.viewMap());
onMounted(() => interactiveMapStore.setLocalMode(props.isLocalMode));
</script>

<template>
  <interactive-map-editor-layout>
    <template #actions>
      <map-editor-action-buttons
        :isViewMode="isViewMode"
        :isDrawMode="isDrawMode"
        :isEditMode="isEditMode"
      >
        <template #viewActions>
          <Button
            v-if="props.manageZones"
            label="Create new zone"
            icon="pi pi-plus"
            severity="success"
            @click="handleStartDrawingZone"
          />
          <Button
            v-if="props.manageSmartFurnitureHookups"
            label="Create new hookup"
            severity="success"
            icon="pi pi-plus"
            @click="handleStartDrawingSmartFurnitureHookup"
          />
          <Button
            label="Edit"
            severity="secondary"
            icon="pi pi-arrows-alt"
            :disabled="!hasZones"
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
            v-if="
              props.manageZones &&
              drawingType === 'zone' &&
              isZoneOnDrawMode &&
              isPolygonClosed
            "
            label="Continue to setup"
            severity="success"
            @click="goToZoneSetup"
          />
          <Button
            v-if="
              props.manageSmartFurnitureHookups &&
              drawingType === 'smart-furniture-hookup' &&
              isSmartFurnitureHookupOnDrawMode &&
              isSmartFurnitureHookupPositioned
            "
            label="Continue to setup"
            severity="success"
            @click="goToSmartFurnitureHookupSetup"
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
        :floor-plan-svg="svgData"
        :cursor="cursorStyle"
        @interactiveMapClick="handleInteractiveMapClick"
        @interactiveMapMouseMove="handleDragMove"
        @mouseup="handleStopDrag"
        @mouseleave="handleStopDrag"
      >
        <template #zones>
          <g v-if="props.manageZones && isDrawMode && isZoneOnDrawMode">
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
            v-for="zone in zones"
            :key="zone.id"
            :zone="zone"
            :editModeActive="props.manageZones && isEditMode"
            @zoneClick="handleStartDragZone"
            @zoneVerticeClick="handleStartDragVertex"
          />
        </template>

        <template #hookups>
          <smart-furniture-hookup
            @smartFurnitureHookupClick="startDragSmartFurnitureHookup"
            v-if="
              props.manageSmartFurnitureHookups &&
              isDrawMode &&
              isSmartFurnitureHookupOnDrawMode &&
              isSmartFurnitureHookupPositioned
            "
            :smartFurnitureHookup="draftSmartFurnitureHookup"
            :editModeActive="true"
          />

          <smart-furniture-hookup
            v-for="sfh in smartFurnitureHookups"
            :key="sfh.id"
            :editModeActive="isEditMode"
            @smartFurnitureHookupClick="handleStartDragSmartFurnitureHookup"
            :smartFurnitureHookup="sfh"
          />
        </template>
      </interactive-map-layout>
    </template>

    <template #sidebar>
      <floor-plan-tree-sidebar
        :tree="tree"
        :hasZones="hasZones"
        :hasZoneActions="props.manageZones"
        :hasSmartFurnitureHookupActions="props.manageSmartFurnitureHookups"
        :disableActionsZone="isDrawMode"
        :disableActionsSmartFurnitureHookup="isDrawMode"
        @editZone="handleEditZone"
        @deleteZone="handleDeleteZone"
        @editSmartFurnitureHookup="handleEditSmartFurnitureHookup"
        @deleteSmartFurnitureHookup="handleDeleteSmartFurnitureHookup"
      />
    </template>
  </interactive-map-editor-layout>

  <zone-information-dialog
    v-model:visible="zoneDialog"
    v-model:zone="draftZone"
    :isOnDrawMode="isZoneOnDrawMode"
    :default-color="displayColor"
    @hide="hideZoneDialog"
    @cancel="hideZoneDialog"
    @save="handleSaveZone"
  />

  <smart-furniture-hookup-information-dialog
    v-model:visible="smartFurnitureHookupDialog"
    v-model:smart-furniture-hookup="draftSmartFurnitureHookup"
    v-model:loading="endpointLoading"
    :isOnDrawMode="isSmartFurnitureHookupOnDrawMode"
    @save="handleSaveSmartFurnitureHookup"
    @hide="hideSmartFurnitureHookupDialog"
    @cancel="hideSmartFurnitureHookupDialog"
    @fetchInfo="fetchAndConfigSmartFurnitureHookupInfo"
    @endpointUpdated="isSmartFurnitureHookupEndpointConfigured = false"
  />
</template>

<style scoped></style>
