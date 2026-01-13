import { ref } from "vue";
import { useSmartFurnitureHookupZoneDetection } from "@/composables/interactiveMap/useSmartFurnitureHookupZoneDetection.js";

export function useSmartFurnitureHookupDrag(existingZones) {
  const { findZoneForSmartFurnitureHookup } =
    useSmartFurnitureHookupZoneDetection(existingZones);

  const dragState = ref({
    isDragging: false,
    smartFurnitureHookup: null,
    startPosition: null,
  });

  function startDragSmartFurnitureHookup(smartFurnitureHookup, position) {
    dragState.value = {
      isDragging: true,
      smartFurnitureHookup: smartFurnitureHookup,
      startPosition: { ...position },
    };
  }

  function handleDragMove(currentPosition) {
    if (!dragState.value.isDragging || !dragState.value.startPosition) {
      return;
    }

    const dx = currentPosition.x - dragState.value.startPosition.x;
    const dy = currentPosition.y - dragState.value.startPosition.y;

    dragState.value.smartFurnitureHookup.position.x += dx;
    dragState.value.smartFurnitureHookup.position.y += dy;

    dragState.value.startPosition = { ...currentPosition };
  }

  function stopDrag() {
    if (!dragState.value.isDragging) return;

    if (dragState.value.smartFurnitureHookup.id) {
      dragState.value.smartFurnitureHookup.zone =
        findZoneForSmartFurnitureHookup(dragState.value.smartFurnitureHookup);
    }

    const draggedSmartFurnitureHookup = dragState.value.smartFurnitureHookup;

    dragState.value = {
      isDragging: false,
      smartFurnitureHookup: null,
      startPosition: null,
    };

    return draggedSmartFurnitureHookup;
  }

  return {
    dragState,
    startDragSmartFurnitureHookup,
    handleDragMove,
    stopDrag,
  };
}
