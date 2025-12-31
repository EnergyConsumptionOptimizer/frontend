import { defineStore } from "pinia";

const MapMode = {
  VIEW: "view",
  DRAW: "draw",
  EDIT: "edit",
};

export const useInteractiveMap = defineStore("interactiveMap", {
  state: () => ({
    svgDataUrl: null,
    svgFileName: null,
    shouldPersist: true,
    zones: [],
    smartFurnitureHookups: [],
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
    uploadSvg(file, filename) {
      this.svgDataUrl = file;
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
      console.log(updates);
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
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ["svgDataUrl", "svgFileName", "zones", "smartFurnitureHookups"],
      },
    ],
  },
});
