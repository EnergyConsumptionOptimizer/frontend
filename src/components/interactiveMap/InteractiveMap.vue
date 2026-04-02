<script setup>
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { storeToRefs } from "pinia";
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";

import { useZoneEditor } from "@/composables/interactiveMap/useZoneEditor.js";
import { useZoneDrag } from "@/composables/interactiveMap/useZoneDrag.js";
import { useSmartFurnitureHookupEditor } from "@/composables/interactiveMap/useSmartFurnitureHookupEditor.js";
import { useSmartFurnitureHookupDrag } from "@/composables/interactiveMap/useSmartFurnitureHookupDrag.js";
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
import { deleteSmartFurnitureHookupDialog } from "@/utils/ui/deleteSmartFurnitureHookupDialog.js";
import { deleteSmartFurnitureHookupTost } from "@/utils/ui/deleteSmartFurnitureHookupTost.js";
import { useMonitoringStore } from "@/stores/monitoringStore.js";
import { useAsyncAction } from "@/composables/utils/asyncAction";
import { SmartFurnitureHookupService } from "@/service/SmartFurnitureService";

const props = defineProps({
  isLocalMode: { type: Boolean, default: false },
  manageZones: { type: Boolean, default: true },
  manageSmartFurnitureHookups: { type: Boolean, default: true },
  bypassHookupSync: { type: Boolean, default: false },
});

const emit = defineEmits([
  "zone-created",
  "zone-deleted",
  "smart-furniture-hookup-created",
  "smart-furniture-hookup-deleted",
]);

const interactiveMapStore = useInteractiveMapStore();
const monitoringStore = useMonitoringStore();

const {
  zones,
  svgData,
  isViewMode,
  isDrawMode,
  isEditMode,
  hasZones,
  hasSmartFurnitureHookups,
  isLoading,
} = storeToRefs(interactiveMapStore);

const smartFurnitureHookups = computed(() => {
  return props.isLocalMode
    ? interactiveMapStore.smartFurnitureHookups
    : interactiveMapStore.realTimeSmartFurnitureHookups;
});

const drawingType = ref(null);
const confirm = useConfirm();
const toast = useToast();
const { isLoading: endpointLoading, perform: performEndpointCheck } =
  useAsyncAction();

const {
  draftZone,
  colorInput,
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
  let success = false;
  if (isZoneOnDrawMode.value) {
    success = await interactiveMapStore.addZone({
      ...draftZone.value,
      name: zoneInfo.name,
      color: zoneInfo.color,
    });
    if (success) {
      doneDrawingZone();
      emit("zone-created", zones.value.length);
    }
  } else if (isZoneOnEditMode.value) {
    success = await interactiveMapStore.updateZone(draftZone.value.id, {
      name: zoneInfo.name,
      color: zoneInfo.color,
    });
    if (success) {
      doneEditingZone();
    }
  }
}

async function fetchAndConfigSmartFurnitureHookupInfo() {
  return await performEndpointCheck(
    async () => {
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
    },
    { toastOnSystemError: false },
  );
}

async function handleSaveSmartFurnitureHookup(smartFurnitureHookupInfo) {
  if (!isSmartFurnitureHookupEndpointConfigured.value) {
    const success = await fetchAndConfigSmartFurnitureHookupInfo();
    if (!success) return;
  }

  let success = false;
  if (isSmartFurnitureHookupOnDrawMode.value) {
    success = await interactiveMapStore.addSmartFurnitureHookup({
      ...draftSmartFurnitureHookup.value,
      smartFurnitureHookupInfo,
    });
    if (success) {
      doneDrawingSmartFurnitureHookup();
      emit(
        "smart-furniture-hookup-created",
        smartFurnitureHookups.value.length,
      );
    }
  } else if (isSmartFurnitureHookupOnEditMode.value) {
    success = await interactiveMapStore.updateSmartFurnitureHookup(
      draftSmartFurnitureHookup.value.id,
      {
        name: smartFurnitureHookupInfo.name,
        endpoint: smartFurnitureHookupInfo.endpoint,
        utilityType: smartFurnitureHookupInfo.utilityType,
      },
    );
    if (success) {
      doneEditingSmartFurnitureHookup();
    }
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

onBeforeMount(() => {
  interactiveMapStore.setLocalMode(props.isLocalMode);
  interactiveMapStore.viewMap();
  if (!props.isLocalMode)
    monitoringStore.subscribeToActiveSmartFurnitureHookups();
});

onBeforeUnmount(() => {
  if (!props.isLocalMode)
    monitoringStore.unsubscribeFromActiveSmartFurnitureHookups();
});

onUnmounted(() => {
  if (!props.isLocalMode) monitoringStore.disconnectMonitoring();
});
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
            class="min-h-11"
            aria-label="Create a new zone on the map"
            @click="handleStartDrawingZone"
          />
          <Button
            v-if="props.manageSmartFurnitureHookups"
            label="Create new hookup"
            severity="success"
            icon="pi pi-plus"
            class="min-h-11"
            aria-label="Create a new smart furniture hookup"
            @click="handleStartDrawingSmartFurnitureHookup"
          />
          <Button
            label="Edit"
            severity="secondary"
            :outlined="!hasZones && !hasSmartFurnitureHookups"
            icon="pi pi-arrows-alt"
            class="min-h-11"
            :disabled="!hasZones && !hasSmartFurnitureHookups"
            aria-label="Enter edit mode to move zones and hookups"
            @click="handleStartEditing"
          />
        </template>
        <template #drawActions>
          <Button
            label="Back"
            severity="secondary"
            icon="pi pi-arrow-left"
            class="min-h-11"
            aria-label="Cancel drawing and return to view mode"
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
            class="min-h-11"
            aria-label="Continue to zone setup dialog"
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
            class="min-h-11"
            aria-label="Continue to hookup setup dialog"
            @click="goToSmartFurnitureHookupSetup"
          />
        </template>
        <template #editActions>
          <Button
            label="Done Editing"
            severity="success"
            class="min-h-11"
            aria-label="Finish editing and return to view mode"
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
        <template #zones="{ scaleFactor }">
          <g v-if="props.manageZones && isDrawMode && isZoneOnDrawMode">
            <incomplete-polygon
              v-if="!isPolygonClosed"
              :points="draftZone.points"
              :color="displayColor"
              :polygon-path="polygonPath"
              :scale-factor="scaleFactor"
            />
            <zone
              v-if="isPolygonClosed"
              :zone="draftZone"
              :edit-mode-active="isPolygonClosed"
              :scale-factor="scaleFactor"
              @zoneClick="startDragZone"
              @zoneVerticeClick="startDragVertex"
            />
          </g>

          <zone
            v-for="zone in zones"
            :key="zone.id"
            :zone="zone"
            :edit-mode-active="props.manageZones && isEditMode"
            :scale-factor="scaleFactor"
            @zoneClick="handleStartDragZone"
            @zoneVerticeClick="handleStartDragVertex"
          />
        </template>

        <template #hookups="{ scaleFactor }">
          <smart-furniture-hookup
            @smartFurnitureHookupClick="startDragSmartFurnitureHookup"
            v-if="
              props.manageSmartFurnitureHookups &&
              isDrawMode &&
              isSmartFurnitureHookupOnDrawMode &&
              isSmartFurnitureHookupPositioned
            "
            :smart-furniture-hookup="draftSmartFurnitureHookup"
            :edit-mode-active="true"
            :scale-factor="scaleFactor"
          />

          <smart-furniture-hookup
            v-for="sfh in smartFurnitureHookups"
            :key="sfh.id"
            :edit-mode-active="isEditMode"
            :scale-factor="scaleFactor"
            @smartFurnitureHookupClick="handleStartDragSmartFurnitureHookup"
            :smart-furniture-hookup="sfh"
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
    v-model:colorInput="colorInput"
    :isOnDrawMode="isZoneOnDrawMode"
    :default-color="displayColor"
    :loading="isLoading"
    @hide="hideZoneDialog"
    @cancel="hideZoneDialog"
    @save="handleSaveZone"
  />

  <smart-furniture-hookup-information-dialog
    v-model:visible="smartFurnitureHookupDialog"
    v-model:smart-furniture-hookup="draftSmartFurnitureHookup"
    v-model:loading="endpointLoading"
    :saving="isLoading"
    :isOnDrawMode="isSmartFurnitureHookupOnDrawMode"
    :bypassSync="props.bypassHookupSync"
    @save="handleSaveSmartFurnitureHookup"
    @hide="hideSmartFurnitureHookupDialog"
    @cancel="hideSmartFurnitureHookupDialog"
    @fetchInfo="fetchAndConfigSmartFurnitureHookupInfo"
    @endpointUpdated="isSmartFurnitureHookupEndpointConfigured = false"
  />
</template>
