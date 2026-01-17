import { defineStore } from "pinia";

import { MonitoringService } from "@/service/MonitoringService.js";
import { ref } from "vue";

export const useMonitoringStore = defineStore("monitoring", () => {
  const monitoringService = new MonitoringService();

  const meters = ref([]);
  const activeSmartFurnitureHookups = ref([]);

  const subscribeToRealTimeMetersUpdates = async () => {
    await monitoringService.subscribeToRealTimeMetersUpdates((update) => {
      meters.value = update;
    });
  };

  const subscribeToActiveSmartFurnitureHookups = async () => {
    await monitoringService.subscribeToActiveSmartFurnitureHookups((update) => {
      activeSmartFurnitureHookups.value = update;
    });
  };

  return {
    subscribeToRealTimeMetersUpdates,
    subscribeToActiveSmartFurnitureHookups,

    meters,
    activeSmartFurnitureHookups,
  };
});
