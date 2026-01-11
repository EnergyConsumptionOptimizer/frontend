export async function saveInteractiveMap(store) {
  const savedHookups = [];
  const savedZones = [];

  try {
    await saveZones(store, savedZones);

    await saveSmartFurnitureHookups(store, savedHookups);

    await store.mapService.saveFloorPlan(store.svgData);
  } catch (error) {
    await rollback(store, savedZones, savedHookups);
    throw error;
  }
}

async function saveZones(store, savedZones) {
  const results = await Promise.allSettled(
    store.zones.map(async (zone) => {
      const savedZone = await store.mapService.saveZone(zone);
      if (savedZone) {
        updateZoneReferences(store, zone, savedZone);
        savedZones.push(savedZone);
      }
    }),
  );

  checkForFailures(results, "Zone save failed");
}

async function saveSmartFurnitureHookups(store, savedHookups) {
  const results = await Promise.allSettled(
    store.smartFurnitureHookups.map(async (sfh) => {
      const saved = await store.mapService.saveSmartFurnitureHookup(sfh);
      if (saved) {
        savedHookups.push(saved);
      }
    }),
  );

  checkForFailures(results, "Smart furniture hookup save failed");
}

function updateZoneReferences(store, zone, savedZone) {
  store.smartFurnitureHookups.forEach((sfh) => {
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

async function rollback(store, savedZones, savedHookups) {
  await Promise.allSettled([
    ...savedZones.map((z) => store.mapService.deleteZone(z.id)),
    ...savedHookups.map((sfh) =>
      store.mapService.deleteSmartFurnitureHookup(sfh.id),
    ),
  ]);
}
