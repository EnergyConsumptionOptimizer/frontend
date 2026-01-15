<script setup>
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import FloorPlanTreeSidebar from "@/components/interactiveMap/FloorPlanTreeSidebar.vue";
import MapEditorActionButtons from "@/components/interactiveMap/MapEditorActionButtons.vue";
import Zone from "@/components/interactiveMap/Zone.vue";
import IncompletePolygon from "@/components/interactiveMap/IncompletePolygon.vue";
import SmartFurnitureHookup from "@/components/interactiveMap/SmartFurnitureHookup.vue";
import InteractiveMapLayout from "@/layout/InteractiveMapLayout.vue";
import InteractiveMapEditorLayout from "@/layout/InteractiveMapEditorLayout.vue";
import { useZoneEditor } from "@/composables/interactiveMap/useZoneEditor.js";
import { useZoneDrag } from "@/composables/interactiveMap/useZoneDrag.js";
import { computeFloorPlanTree } from "@/utils/floorPlanTree.js";
import { useSmartFurnitureHookupEditor } from "@/composables/interactiveMap/useSmartFurnitureHookupEditor.js";
import { useSmartFurnitureHookupDrag } from "@/composables/interactiveMap/useSmartFurnitureHookupDrag.js";
import ZoneInformationDialog from "@/components/interactiveMap/ZoneInformationDialog.vue";

import { useConfirm, useToast } from "primevue";
import { deleteZoneDialog } from "@/utils/ui/deleteZoneDialog.js";
import { deleteZoneToast } from "@/utils/ui/deleteZoneToast.js";
import { collisionZoneToast } from "@/utils/ui/collisionZoneToast.js";
import axios from "axios";
import { cannotFetchSmartFurnitureHookupInfoToast } from "@/utils/ui/cannotFetchSmartFurnitureHookupInfoToast.js";
import SmartFurnitureHookupInformationDialog from "@/components/interactiveMap/SmartFurnitureHookupInformationDialog.vue";
import { useSmartFurnitureHookupZoneDetection } from "@/composables/interactiveMap/useSmartFurnitureHookupZoneDetection.js";
import { deleteSmartFurnitureHookupDialog } from "@/utils/ui/deleteSmartFurnitureHookupDialog.js";
import { deleteSmartFurnitureHookupTost } from "@/utils/ui/deleteSmartFurnitureHookupTost.js";

const props = defineProps({
  isLocalMode: {
    type: Boolean,
    default: false,
  },
  manageZones: {
    type: Boolean,
    default: true,
  },
  manageSmartFurnitureHookups: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits([
  "zone-created",
  "zone-deleted",
  "smart-furniture-hookup-created",
  "smart-furniture-hookup-deleted",
]);

const interactiveMapStore = useInteractiveMapStore();
const drawingType = ref(null);

const existingZones = computed(() => interactiveMapStore.zones);
const existingSmartFurnitureHookups = computed(
  () => interactiveMapStore.smartFurnitureHookups,
);

const confirm = useConfirm();
const toast = useToast();
const endpointLoading = ref(false);

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
  finalizeZone,
  doneEditingZone,
  loadZoneForEdit,
  goToSetup: goToZoneSetup,
  isZoneOnDrawMode,
  isZoneOnEditMode,
  hideZoneDialog,
} = useZoneEditor(existingZones);

const {
  dragState: zonedDagState,
  startDragZone,
  startDragVertex,
  handleDragMove: handleZoneDragMove,
  stopDrag: stopZoneDrag,
} = useZoneDrag(existingZones, existingSmartFurnitureHookups);

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
  finalizeSmartFurnitureHookup,
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
} = useSmartFurnitureHookupDrag(existingZones);

const { findZoneForSmartFurnitureHookup } =
  useSmartFurnitureHookupZoneDetection(existingZones);

const tree = computed(() =>
  computeFloorPlanTree(
    interactiveMapStore.zones,
    interactiveMapStore.smartFurnitureHookups,
  ),
);
const cursorStyle = computed(() => {
  if (
    interactiveMapStore.isDrawMode &&
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

async function handleSaveZone() {
  const name = draftZone.value.name.trim();

  if (!name) {
    return;
  }

  if (isZoneOnDrawMode.value) {
    const newZone = finalizeZone();
    await interactiveMapStore.addZone(newZone);

    emit("zone-created", interactiveMapStore.zones.length);
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

function handleDeleteZone(zoneId) {
  confirm.require(
    deleteZoneDialog(async () => {
      await interactiveMapStore.deleteZone(zoneId);

      emit("zone-deleted", interactiveMapStore.zones.length);
      toast.add(deleteZoneToast);
    }),
  );
}

async function fetchAndConfigSmartFurnitureHookupInfo() {
  endpointLoading.value = true;
  try {
    const response = await axios.get(draftSmartFurnitureHookup.value.endpoint);

    if (!response.data || !(response.data.name || response.data.utilityType)) {
      toast.add(cannotFetchSmartFurnitureHookupInfoToast);
      return;
    }

    isSmartFurnitureHookupEndpointConfigured.value = true;

    if (!draftSmartFurnitureHookup.value.name)
      draftSmartFurnitureHookup.value.name = response.data.name;

    draftSmartFurnitureHookup.value.utilityType = response.data.node_type;

    return true;
  } catch (error) {
    toast.add(cannotFetchSmartFurnitureHookupInfoToast);
    return false;
  } finally {
    endpointLoading.value = false;
  }
}

async function handleSaveSmartFurnitureHookup() {
  if (
    !isSmartFurnitureHookupEndpointConfigured.value &&
    !(await fetchAndConfigSmartFurnitureHookupInfo())
  ) {
    return;
  }

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

    await interactiveMapStore.addSmartFurnitureHookup(newSmartFurnitureHookup);
    emit(
      "smart-furniture-hookup-created",
      interactiveMapStore.smartFurnitureHookups.length,
    );
  } else if (isSmartFurnitureHookupOnEditMode.value) {
    await interactiveMapStore.updateSmartFurnitureHookup(
      draftSmartFurnitureHookup.value.id,
      {
        name: name,
        endpoint: draftSmartFurnitureHookup.value.endpoint,
        utilityType: draftSmartFurnitureHookup.value.utilityType,
      },
    );

    doneEditingSmartFurnitureHookup();
  }
}

async function handleEditSmartFurnitureHookup(smartFurnitureHookupId) {
  if (interactiveMapStore.isDrawMode) {
    handleStopDrawing();
  }

  const smartFurnitureHookup =
    await interactiveMapStore.findSmartFurnitureHookup(smartFurnitureHookupId);

  if (!smartFurnitureHookup) return;

  loadSmartFurnitureHookupForEdit(smartFurnitureHookup);
}

async function handleDeleteSmartFurnitureHookup(smartFurnitureHookupId) {
  confirm.require(
    deleteSmartFurnitureHookupDialog(async () => {
      await interactiveMapStore.deleteSmartFurnitureHookup(
        smartFurnitureHookupId,
      );
      emit(
        "smart-furniture-hookup-deleted",
        interactiveMapStore.smartFurnitureHookups.length,
      );
      toast.add(deleteSmartFurnitureHookupTost);
    }),
  );
}

function handleInteractiveMapClick(point) {
  if (!interactiveMapStore.isDrawMode) return;

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
function handleStartDragSmartFurnitureHookup(smartFurnitureHookup, position) {
  if (props.manageSmartFurnitureHookups)
    startDragSmartFurnitureHookup(smartFurnitureHookup, position);
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
  const draggedSmartFurnitureHookup = stopSmartFurnitureHookupDrag();

  if (!draggedSmartFurnitureHookup.id) return;

  await interactiveMapStore.updateSmartFurnitureHookup(
    draggedSmartFurnitureHookup.id,
    {
      position: draggedSmartFurnitureHookup.position,
      zone: draggedSmartFurnitureHookup.zone,
    },
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
  interactiveMapStore.setLocalMode(props.isLocalMode);
});
</script>

<template>
  <interactive-map-editor-layout class="!2xl:w-[1200px]">
    <template #actions>
      <map-editor-action-buttons
        :isViewMode="interactiveMapStore.isViewMode"
        :isDrawMode="interactiveMapStore.isDrawMode"
        :isEditMode="interactiveMapStore.isEditMode"
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
        :floor-plan-svg="interactiveMapStore.svgData"
        :cursor="cursorStyle"
        @interactiveMapClick="handleInteractiveMapClick"
        @interactiveMapMouseMove="handleDragMove"
        @mouseup="handleStopDrag"
        @mouseleave="handleStopDrag"
      >
        <template #zones>
          <g
            v-if="
              props.manageZones &&
              interactiveMapStore.isDrawMode &&
              isZoneOnDrawMode
            "
          >
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
            :editModeActive="
              props.manageZones && interactiveMapStore.isEditMode
            "
            @zoneClick="handleStartDragZone"
            @zoneVerticeClick="handleStartDragVertex"
          />
        </template>

        <template #hookups>
          <smart-furniture-hookup
            @smartFurnitureHookupClick="startDragSmartFurnitureHookup"
            v-if="
              props.manageSmartFurnitureHookups &&
              interactiveMapStore.isDrawMode &&
              isSmartFurnitureHookupOnDrawMode &&
              isSmartFurnitureHookupPositioned
            "
            :smartFurnitureHookup="draftSmartFurnitureHookup"
            :editModeActive="true"
          />

          <smart-furniture-hookup
            v-for="sfh in interactiveMapStore.smartFurnitureHookups"
            :key="sfh.id"
            :editModeActive="interactiveMapStore.isEditMode"
            @smartFurnitureHookupClick="handleStartDragSmartFurnitureHookup"
            :smartFurnitureHookup="sfh"
          />
        </template>
      </interactive-map-layout>
    </template>
    <template #sidebar>
      <floor-plan-tree-sidebar
        :tree="tree"
        :hasZones="interactiveMapStore.hasZones"
        :hasZoneActions="props.manageZones"
        :hasSmartFurnitureHookupActions="props.manageSmartFurnitureHookups"
        :disableActionsZone="interactiveMapStore.isDrawMode"
        :disableActionsSmartFurnitureHookup="interactiveMapStore.isDrawMode"
        @editZone="handleEditZone"
        @deleteZone="handleDeleteZone"
        @editSmartFurnitureHookup="handleEditSmartFurnitureHookup"
        @deleteSmartFurnitureHookup="handleDeleteSmartFurnitureHookup"
      />
    </template>
  </interactive-map-editor-layout>
  <zone-information-dialog
    :isOnDrawMode="isZoneOnDrawMode"
    v-model:visible="zoneDialog"
    v-model:colorInput="colorInput"
    v-model:zone="draftZone"
    @hide="hideZoneDialog"
    @cancel="hideZoneDialog"
    @save="handleSaveZone"
  />
  <smart-furniture-hookup-information-dialog
    :isOnDrawMode="isSmartFurnitureHookupOnDrawMode"
    v-model:visible="smartFurnitureHookupDialog"
    v-model:loading="endpointLoading"
    v-model:smartFurnitureHookup="draftSmartFurnitureHookup"
    @save="handleSaveSmartFurnitureHookup"
    @hide="hideSmartFurnitureHookupDialog"
    @cancel="hideSmartFurnitureHookupDialog"
    @fetchInfo="fetchAndConfigSmartFurnitureHookupInfo"
    @endpointUpdated="isSmartFurnitureHookupEndpointConfigured = false"
  />
</template>

<style scoped></style>
