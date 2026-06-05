import { useZoneCollision } from "@/composables/interactiveMap/useZoneCollision.js";

export function useSmartFurnitureHookupZoneDetection(existingZones) {
  const collision = useZoneCollision();

  function findZoneForSmartFurnitureHookup(hookup) {
    if (
      !hookup ||
      hookup.position == null ||
      hookup.position.x == null ||
      hookup.position.y == null
    ) {
      return null;
    }

    for (const zone of existingZones.value) {
      if (collision.isPointInPolygon(hookup.position, zone.points)) {
        return zone.id;
      }
    }

    return null;
  }

  return {
    findZoneForSmartFurnitureHookup,
  };
}
