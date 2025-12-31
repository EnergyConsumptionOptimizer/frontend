import { useZoneCollision } from "@/composables/interactiveMap/useZoneCollision.js";

export function useSmartFurnitureHookupZoneDetection(existingZones) {
  const collision = useZoneCollision();

  function findZoneForSmartFurnitureHookup(hookup) {
    if (!hookup || !hookup.position.x || !hookup.position.y) {
      return null;
    }

    for (const zone of existingZones.value) {
      if (collision.isPointInPolygon(hookup.position, zone.points)) {
        console.log(zone.id);
        return zone.id;
      }
    }

    return null;
  }

  return {
    findZoneForSmartFurnitureHookup,
  };
}
