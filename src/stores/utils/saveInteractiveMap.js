import { InteractiveMapService } from "@/service/InteractiveMapService.js";

export async function saveInteractiveMap(
  svgData,
  zones,
  smartFurnitureHookups,
) {
  const savedSmartFurnitureHookups = [];
  const savedZones = [];

  try {
    await saveZones(zones, savedZones, smartFurnitureHookups);

    await saveSmartFurnitureHookups(
      smartFurnitureHookups,
      savedSmartFurnitureHookups,
    );

    await InteractiveMapService.saveFloorPlan(svgData);
  } catch (error) {
    await rollback(savedZones, savedSmartFurnitureHookups);
    throw error;
  }
}

async function saveZones(zones, savedZones, smartFurnitureHookups) {
  const results = await Promise.allSettled(
    zones.map(async (zone) => {
      const savedZone = await InteractiveMapService.addZone(zone);

      if (savedZone) {
        updateZoneReferences(zone, savedZone, smartFurnitureHookups);
        savedZones.push(savedZone);
      }
    }),
  );

  checkForFailures(results, "Zone save failed");
}

async function saveSmartFurnitureHookups(
  smartFurnitureHookups,
  savedSmartFurnitureHookups,
) {
  const results = await Promise.allSettled(
    smartFurnitureHookups.map(async (sfh) => {
      const saved = await InteractiveMapService.addSmartFurnitureHookup(sfh);
      if (saved) {
        savedSmartFurnitureHookups.push(saved);
      }
    }),
  );

  checkForFailures(results, "Smart furniture hookup save failed");
}

function updateZoneReferences(zone, savedZone, smartFurnitureHookups) {
  smartFurnitureHookups.forEach((sfh) => {
    if (String(sfh.zone) === zone.id) {
      sfh.zone = savedZone.id;
    }
  });
  zone.id = savedZone.id;
}

function checkForFailures(results, errorPrefix) {
  const failures = results.filter((r) => r.status === "rejected");

  if (failures.length > 0) {
    failures.forEach((f) => console.error(`${errorPrefix}:`, f.reason));
    throw new Error(errorPrefix);
  }
}

async function rollback(savedZones, savedSmartFurnitureHookups) {
  await Promise.allSettled([
    ...savedZones.map(
      async (z) => await InteractiveMapService.deleteZone(z.id),
    ),
    ...savedSmartFurnitureHookups.map(
      async (sfh) =>
        await InteractiveMapService.deleteSmartFurnitureHookup(sfh.id),
    ),
  ]);
}
