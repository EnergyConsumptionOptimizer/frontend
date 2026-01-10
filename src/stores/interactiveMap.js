import { defineStore } from "pinia";

const MapMode = {
  VIEW: "view",
  DRAW: "draw",
  EDIT: "edit",
};

const checkShouldPersist = () => {
  const storeShouldPersist = localStorage.getItem("shouldStoresPersist");

  if (!storeShouldPersist) {
    localStorage.removeItem("interactiveMap");
    return false;
  }

  return true;
};

export const useInteractiveMap = defineStore("interactiveMap", {
  state: () => ({
    svgData: null,
    svgFileName: null,
    zones: [],
    smartFurnitureHookups: [],
    mapService: null,
  }),
  getters: {
    isViewMode: (state) => state.mode === MapMode.VIEW,
    isDrawMode: (state) => state.mode === MapMode.DRAW,
    isEditMode: (state) => state.mode === MapMode.EDIT,

    hasZones: (state) => state.zones.length > 0,
    hasSmartFurnitureHookups: (state) => state.smartFurnitureHookups.length > 0,

    zoneCount: (state) => state.zones.length,
    smartFurnitureHookupsCount: (state) => state.smartFurnitureHookups.length,
  },
  actions: {
    initializeWithService(mapService) {
      this.mapService = mapService;
    },
    async syncAndFinalize() {
      await this.mapService?.saveFloorPlan(this.svgData);

      await Promise.all(
        this.zones.map(async (zone) => {
          const savedZone = await this.mapService?.saveZone(zone);
          if (savedZone) {
            this.smartFurnitureHookups.forEach((sfh) => {
              console.log(sfh.zone === zone.id);

              if (String(sfh.zone) === zone.id) {
                sfh.zone = savedZone.id;
              }
            });
          }
        }),
      );

      await Promise.all(
        this.smartFurnitureHookups.map(async (sfh) => {
          this.mapService?.saveSmartFurnitureHookup(sfh);
        }),
      );
    },
    uploadSvg(file, filename) {
      this.svgData = file;
      this.svgFileName = filename;
    },
    resetMap() {
      this.zones = [];
      this.smartFurnitureHookups = [];
    },
    startDrawing() {
      this.mode = MapMode.DRAW;
    },
    startEditing() {
      this.mode = MapMode.EDIT;
    },
    viewMap() {
      this.mode = MapMode.VIEW;
    },
    findZone(id) {
      return this.zones.find((zone) => zone.id === id);
    },
    addZone(zone) {
      this.zones.push(zone);
    },
    updateZone(id, updates) {
      const index = this.zones.findIndex((zone) => zone.id === id);

      if (index !== -1) {
        this.zones[index] = { ...this.zones[index], ...updates };
      }
    },
    deleteZone(id) {
      this.zones = this.zones.filter((zone) => zone.id !== id);

      this.smartFurnitureHookups
        .filter((sfh) => sfh.zone === id)
        .forEach((sfh) => {
          sfh.zone = null;
        });
    },
    addSmartFurnitureHookup(smartFurnitureHookup) {
      this.smartFurnitureHookups.push(smartFurnitureHookup);
    },
    findSmartFurnitureHookup(id) {
      return this.smartFurnitureHookups.find((sfh) => sfh.id === id);
    },
    updateSmartFurnitureHookup(id, updates) {
      const index = this.smartFurnitureHookups.findIndex(
        (sfh) => sfh.id === id,
      );

      if (index !== -1) {
        this.smartFurnitureHookups[index] = {
          ...this.smartFurnitureHookups[index],
          ...updates,
        };
      }
    },
    deleteSmartFurnitureHookup(id) {
      this.smartFurnitureHookups = this.smartFurnitureHookups.filter(
        (sfh) => sfh.id !== id,
      );
    },
  },
  persist: {
    enabled: checkShouldPersist(),
  },
});
