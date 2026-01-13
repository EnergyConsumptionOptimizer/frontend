import { useZoneCollision } from "@/composables/interactiveMap/useZoneCollision.js";
const STORAGE_KEY = "onboarding_temp_interactive_map";

const getStore = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || null);
const setStore = (data) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
const updateStore = (partial) => {
  const current = getStore();
  setStore({
    ...current,
    ...partial,
  });
};

const collision = useZoneCollision();

export const InteractiveMapLocalService = {
  async fetchFloorPlan() {
    return getStore().svgData ?? "";
  },
  async fetchZones() {
    return getStore().zones ?? [];
  },
  async fetchSmartFurnitureHookups() {
    return getStore().smartFurnitureHookups ?? [];
  },
  async getSvgFileName() {
    return getStore().svgFileName ?? "";
  },
  async uploadSvg(svgData, svgFileName) {
    updateStore({
      svgData,
      svgFileName,
    });

    return {
      svgData,
      svgFileName,
    };
  },
  async findZone(id) {
    const zones = await this.fetchZones();
    return zones.find((zone) => zone.id === id);
  },
  async addZone(zone) {
    const zones = await this.fetchZones();

    zones.push(zone);
    updateStore({
      zones,
    });

    return zone;
  },
  async updateZone(id, payload) {
    const zones = await this.fetchZones();

    const index = zones.findIndex((zone) => zone.id === id);

    if (index === -1) {
      throw Error("Invalid zone id");
    }

    const newZone = { ...zones[index], ...payload };
    zones[index] = newZone;

    updateStore({
      zones,
    });

    if (!payload.points) return newZone;

    const smartFurnitureHookups = await this.fetchSmartFurnitureHookups();

    for (const sfh of smartFurnitureHookups) {
      if (collision.isPointInPolygon(sfh.position, payload.points)) {
        await this.updateSmartFurnitureHookup(sfh.id, {
          zone: id,
        });
      } else if (sfh.zone && sfh.zone === id) {
        await this.updateSmartFurnitureHookup(sfh.id, {
          zone: null,
        });
      }
    }

    return newZone;
  },
  async deleteZone(id) {
    let zones = await this.fetchZones();
    zones = zones.filter((zone) => zone.id !== id);

    updateStore({
      zones,
    });
  },

  async findSmartFurnitureHookup(id) {
    const smartFurnitureHookups = await this.fetchSmartFurnitureHookups();
    return smartFurnitureHookups.find((sfh) => sfh.id === id);
  },
  async addSmartFurnitureHookup(smartFurnitureHookup) {
    const smartFurnitureHookups = await this.fetchSmartFurnitureHookups();

    smartFurnitureHookups.push(smartFurnitureHookup);

    updateStore({
      smartFurnitureHookups,
    });

    return smartFurnitureHookup;
  },
  async updateSmartFurnitureHookup(id, payload) {
    const smartFurnitureHookups = await this.fetchSmartFurnitureHookups();
    const index = smartFurnitureHookups.findIndex((sfh) => sfh.id === id);

    if (index === -1) {
      throw Error("Invalid smart furniture hookup id");
    }

    const newSmartFurnitureHookup = {
      ...smartFurnitureHookups[index],
      ...payload,
    };
    smartFurnitureHookups[index] = newSmartFurnitureHookup;

    updateStore({
      smartFurnitureHookups,
    });

    return newSmartFurnitureHookup;
  },
  async updateSmartFurnitureHookups(smartFurnitureHookupsToUpdate) {
    const smartFurnitureHookups = await this.fetchSmartFurnitureHookups();

    const updatesMap = new Map(
      smartFurnitureHookupsToUpdate.map((sfh) => [sfh.id, sfh]),
    );

    updateStore({
      smartFurnitureHookups: smartFurnitureHookups.map((sfh) =>
        updatesMap.has(sfh.id) ? { ...sfh, ...updatesMap.get(sfh.id) } : sfh,
      ),
    });
  },
  async deleteSmartFurnitureHookup(id) {
    let smartFurnitureHookups = await this.fetchSmartFurnitureHookups();
    smartFurnitureHookups = smartFurnitureHookups.filter(
      (sfh) => sfh.id !== id,
    );

    updateStore({
      smartFurnitureHookups,
    });
  },
};
