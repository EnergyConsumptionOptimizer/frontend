import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useAsyncAction } from "@/composables/utils/asyncAction.js";
import { InteractiveMapLocalService } from "@/service/local/InteractiveMapLocalService.js";
import { InteractiveMapService } from "@/service/InteractiveMapService.js";
import { saveInteractiveMap } from "@/stores/utils/saveInteractiveMap.js";
import { useMonitoringStore } from "@/stores/monitoringStore.js";

export const useInteractiveMapStore = defineStore("interactiveMap", () => {
  const mapMode = {
    VIEW: "view",
    DRAW: "draw",
    EDIT: "edit",
  };

  const svgData = ref(null);
  const svgFileName = ref(null);
  const zones = ref([]);
  const smartFurnitureHookups = ref([]);
  const mode = ref(mapMode.VIEW);

  const isLocalMode = ref(false);
  const { isLoading, error, perform } = useAsyncAction();

  const isViewMode = computed(() => mode.value === mapMode.VIEW);
  const isDrawMode = computed(() => mode.value === mapMode.DRAW);
  const isEditMode = computed(() => mode.value === mapMode.EDIT);

  const hasZones = computed(() => zones.value.length > 0);
  const hasSmartFurnitureHookups = computed(
    () => smartFurnitureHookups.value.length > 0,
  );

  const activeService = computed(() =>
    isLocalMode.value ? InteractiveMapLocalService : InteractiveMapService,
  );

  const setLocalMode = async (active) => {
    isLocalMode.value = active;

    if (isLocalMode.value) {
      await perform(async () => {
        if (!svgData.value)
          svgFileName.value = await activeService.value.getSvgFileName();
      });
    }

    await fetchMapElements();
  };

  const fetchMapElements = async () => {
    if (
      !svgData.value &&
      zones.value.length === 0 &&
      smartFurnitureHookups.value.length === 0
    ) {
      const data = await activeService.value.fetchHouseMap();
      svgData.value = data.svgData ?? "";
      zones.value = data.zones ?? [];
      smartFurnitureHookups.value = data.smartFurnitureHookups ?? [];

      return;
    }

    await Promise.allSettled([
      perform(async () => {
        if (svgData.value === null)
          svgData.value = await activeService.value.fetchFloorPlan();
      }),
      perform(async () => {
        if (zones.value.length === 0)
          zones.value = await activeService.value.fetchZones();
      }),
      perform(async () => {
        if (smartFurnitureHookups.value.length === 0)
          smartFurnitureHookups.value =
            await activeService.value.fetchSmartFurnitureHookups();
      }),
    ]);
  };

  const syncAndFinalize = () =>
    perform(async () => {
      if (!isLocalMode.value) return;
      await fetchMapElements();

      await saveInteractiveMap(
        svgData.value,
        zones.value,
        smartFurnitureHookups.value,
      );

      isLocalMode.value = false;
      zones.value = [];
      smartFurnitureHookups.value = [];

      await fetchMapElements();

      InteractiveMapLocalService.clear();

      return true;
    });

  const uploadSvg = async (file, filename) => {
    const result = await activeService.value.saveFloorPlan(file, filename);
    zones.value = [];
    smartFurnitureHookups.value = [];
    svgData.value = result.svgData;
    svgFileName.value = result.svgFileName;
  };

  const getSvgFileName = async () => {
    if (!isLocalMode.value) {
      return;
    }

    if (!svgFileName.value) {
      svgFileName.value = await activeService.value.getSvgFileName();
    }

    return svgFileName.value;
  };

  const resetMap = async () => {
    zones.value = [];
    smartFurnitureHookups.value = [];
  };

  const startDrawing = () => {
    mode.value = mapMode.DRAW;
  };

  const startEditing = () => {
    mode.value = mapMode.EDIT;
  };

  const viewMap = () => {
    mode.value = mapMode.VIEW;
  };

  const findZone = async (id) => {
    const zone = zones.value.find((z) => z.id === id);
    return zone ?? (await activeService.value.findZone(id));
  };

  const addZone = (zone) =>
    perform(
      async () => {
        const newZone = await activeService.value.addZone(zone);
        zones.value.push(newZone);
        smartFurnitureHookups.value =
          await activeService.value.fetchSmartFurnitureHookups();
      },
      { suppressToastForCodes: ["CONFLICT", "VALIDATION_ERROR"] },
    );

  const updateZone = (id, payload) =>
    perform(
      async () => {
        const updatedZone = await activeService.value.updateZone(id, payload);
        const index = zones.value.findIndex((zone) => zone.id === id);

        if (index !== -1) {
          zones.value[index] = updatedZone;
        } else {
          zones.value.push(updatedZone);
        }

        if (payload.points) {
          smartFurnitureHookups.value =
            await activeService.value.fetchSmartFurnitureHookups();
        }
      },
      { suppressToastForCodes: ["CONFLICT", "VALIDATION_ERROR"] },
    );

  const updateZonePosition = (id, payload) =>
    perform(async () => {
      // First update the position of moved hookups
      await activeService.value.updateSmartFurnitureHookupsPosition(
        smartFurnitureHookups.value.filter((sfh) => sfh.zone === id),
      );
      // Then update the zone
      const updatedZone = await activeService.value.updateZone(id, payload);

      const index = zones.value.findIndex((zone) => zone.id === id);
      if (index !== -1) zones.value[index] = updatedZone;
      smartFurnitureHookups.value =
        await activeService.value.fetchSmartFurnitureHookups();
    });

  const deleteZone = (id) =>
    perform(async () => {
      await activeService.value.deleteZone(id);
      zones.value = zones.value.filter((zone) => zone.id !== id);
      smartFurnitureHookups.value =
        await activeService.value.fetchSmartFurnitureHookups();
    });

  const findSmartFurnitureHookup = async (id) => {
    const smartFurnitureHookup = smartFurnitureHookups.value.find(
      (sfh) => sfh.id === id,
    );
    return (
      smartFurnitureHookup ??
      (await activeService.value.findSmartFurnitureHookup(id))
    );
  };

  const addSmartFurnitureHookup = (smartFurnitureHookup) =>
    perform(
      async () => {
        const newSmartFurnitureHookup =
          await activeService.value.addSmartFurnitureHookup(
            smartFurnitureHookup,
          );
        smartFurnitureHookups.value.push(newSmartFurnitureHookup);
      },
      { suppressToastForCodes: ["CONFLICT", "VALIDATION_ERROR"] },
    );

  const updateSmartFurnitureHookup = (id, payload) =>
    perform(
      async () => {
        const updatedSmartFurnitureHookup =
          await activeService.value.updateSmartFurnitureHookup(id, payload);

        const index = smartFurnitureHookups.value.findIndex(
          (sfh) => sfh.id === id,
        );

        if (index !== -1) {
          smartFurnitureHookups.value[index] = updatedSmartFurnitureHookup;
        } else {
          smartFurnitureHookups.value.push(updatedSmartFurnitureHookup);
        }
      },
      { suppressToastForCodes: ["CONFLICT", "VALIDATION_ERROR"] },
    );

  const deleteSmartFurnitureHookup = (id) =>
    perform(async () => {
      await activeService.value.deleteSmartFurnitureHookup(id);
      smartFurnitureHookups.value = smartFurnitureHookups.value.filter(
        (sfh) => sfh.id !== id,
      );
    });

  const monitoringStore = useMonitoringStore();
  const { activeSmartFurnitureHookups } = storeToRefs(monitoringStore);

  const realTimeSmartFurnitureHookups = computed(() => {
    if (isLocalMode.value) smartFurnitureHookups.value;

    const activeMap = new Map(
      activeSmartFurnitureHookups.value.map((a) => [a.id, a]),
    );

    return smartFurnitureHookups.value.map((sfh) => {
      const active = activeMap.get(sfh.id);

      if (!active) {
        return { ...sfh, active: false };
      }

      return {
        ...sfh,
        active: true,
        utilityConsumption: `${active.utilityConsumption.value}${active.utilityConsumption.utilityConsumptionUnit}`,
      };
    });
  });

  return {
    svgData,
    svgFileName,
    zones,
    smartFurnitureHookups,
    realTimeSmartFurnitureHookups,
    mode,
    hasZones,
    hasSmartFurnitureHookups,
    isLoading,
    error,
    isViewMode,
    isDrawMode,
    isEditMode,

    syncAndFinalize,
    setLocalMode,
    uploadSvg,
    getSvgFileName,
    resetMap,
    startDrawing,
    startEditing,
    viewMap,
    findZone,
    addZone,
    updateZone,
    updateZonePosition,
    deleteZone,
    findSmartFurnitureHookup,
    addSmartFurnitureHookup,
    updateSmartFurnitureHookup,
    deleteSmartFurnitureHookup,
  };
});
