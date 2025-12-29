import { defineStore } from "pinia";
import { ForecastService } from "@/service/ForecastService";

export const useForecastStore = defineStore("forecast", {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    lastFetched: null,
  }),

  getters: {
    getByUtility: (state) => (utilityType) => {
      return state.items.find((f) => f.utilityType === utilityType);
    },
  },

  actions: {
    async fetchAll(force = false) {
      if (!force && this.items.length > 0) return;

      this.loading = true;
      this.error = null;

      try {
        this.items = await ForecastService.getForecasts();
        this.lastFetched = Date.now();
      } catch (err) {
        this.error = err;
        this.items = [];
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
});
