import { defineStore } from "pinia";

export const useInteractiveMap = defineStore("interactiveMap", {
  state: () => ({
    svgDataUrl: null,
    svgFileName: null,
    shouldPersist: true,
    zones: [],
    smartFurnitureHookups: [],
  }),
  getters: {
    hasZones: (state) => state.zones.length > 0,
    hasSmartFurnitureHookups: (state) => state.smartFurnitureHookups.length > 0,
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
