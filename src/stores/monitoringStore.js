import { defineStore } from "pinia";

import { MonitoringService } from "@/service/MonitoringService.js";
import { ref } from "vue";

export const useMonitoringStore = defineStore("monitoring", () => {
  const monitoringService = new MonitoringService();

  const meters = ref([]);
  const activeSmartFurnitureHookups = ref([]);

  const realTimeConsumptions = ref([]);
  const historicalConsumptions = ref([]);

  const REAL_TIME_CONSUMPTION_QUERY_LABEL = "real-time-consumptions";
  const HISTORICAL_CONSUMPTION_QUERY_LABEL = "historical-consumptions";

  const consumption_queries = ref([]);

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

  const setupConsumptionQuery = (
    label,
    utilityType,
    timeRange,
    granularity,
    user,
    zone,
  ) => {
    if (user === "all") {
      user = null;
    }
    if (zone === "all") {
      zone = null;
    }

    return {
      label: label,
      utilityType: utilityType,
      filter: {
        from: timeRange,
        granularity: granularity,
      },
      tagsFilter: {
        username: user ?? null,
        zone: zone ?? null,
      },
    };
  };

  const hasConsumptionQuery = (label) => {
    const index = consumption_queries.value.findIndex((q) => q.label === label);

    if (index !== -1) {
      console.warn(`Query label ${label} already exists`);
      return true;
    }

    return false;
  };

  const updateConsumptionQueries = (label, query) => {
    const index = consumption_queries.value.findIndex((q) => q.label === label);

    if (index !== -1) {
      consumption_queries.value.splice(index, 1, query);
    } else {
      consumption_queries.value.push(query);
    }
  };

  const setRealTimeConsumptionsQuery = (
    utilityType,
    timeRange,
    granularity,
    user = null,
    zone = null,
  ) => {
    if (hasConsumptionQuery(REAL_TIME_CONSUMPTION_QUERY_LABEL)) return;

    consumption_queries.value.push(
      setupConsumptionQuery(
        REAL_TIME_CONSUMPTION_QUERY_LABEL,
        utilityType,
        timeRange,
        granularity,
        user,
        zone,
      ),
    );
  };

  const setHistoricalConsumptionsQuery = (
    utilityType,
    timeRange,
    granularity,
    user = null,
    zone = null,
  ) => {
    if (hasConsumptionQuery(HISTORICAL_CONSUMPTION_QUERY_LABEL)) return;

    consumption_queries.value.push(
      setupConsumptionQuery(
        HISTORICAL_CONSUMPTION_QUERY_LABEL,
        utilityType,
        timeRange,
        granularity,
        user,
        zone,
      ),
    );
  };

  const subscribeToUtilityConsumptions = async () => {
    await monitoringService.subscribeToUtilityConsumptions(
      consumption_queries.value,
      (update) => {
        if (!Array.isArray(update)) return;

        update.forEach((update) => {
          if (!update || !update.label) return;

          switch (update.label) {
            case REAL_TIME_CONSUMPTION_QUERY_LABEL:
              console.log(
                REAL_TIME_CONSUMPTION_QUERY_LABEL,
                update.utilityConsumptions,
              );
              realTimeConsumptions.value = update.utilityConsumptions;
              break;
            case HISTORICAL_CONSUMPTION_QUERY_LABEL:
              console.log(
                HISTORICAL_CONSUMPTION_QUERY_LABEL,
                update.utilityConsumptions,
              );
              historicalConsumptions.value = update.utilityConsumptions;
              break;
          }
        });
      },
    );
  };

  const updateRealTimeQuery = async (
    utilityType,
    timeRange,
    granularity,
    user,
    zone,
  ) => {
    const label = REAL_TIME_CONSUMPTION_QUERY_LABEL;

    const query = setupConsumptionQuery(
      label,
      utilityType,
      timeRange,
      granularity,
      user,
      zone,
    );

    updateConsumptionQueries(label, query);

    await monitoringService.editUtilityConsumptionQuery(query);
  };

  const updateHistoricalQuery = async (
    utilityType,
    timeRange,
    granularity,
    user,
    zone,
  ) => {
    const label = HISTORICAL_CONSUMPTION_QUERY_LABEL;

    const query = setupConsumptionQuery(
      label,
      utilityType,
      timeRange,
      granularity,
      user,
      zone,
    );

    updateConsumptionQueries(label, query);

    await monitoringService.editUtilityConsumptionQuery(query);
  };

  const unsubscribeFromRealTimeMetersUpdates = async () => {
    meters.value = [];
    await monitoringService.unsubscribeFromRealTimeMetersUpdates();
  };
  const unsubscribeFromActiveSmartFurnitureHookups = async () => {
    activeSmartFurnitureHookups.value = [];
    await monitoringService.unsubscribeFromActiveSmartFurnitureHookups();
  };
  const unsubscribeFromUtilityConsumptions = async () => {
    realTimeConsumptions.value = [];
    historicalConsumptions.value = [];
    consumption_queries.value = [];
    await monitoringService.unsubscribeFromUtilityConsumptions();
  };

  const disconnectMonitoring = () => {
    monitoringService.disconnect();
  };

  return {
    meters,
    activeSmartFurnitureHookups,
    realTimeConsumptions,
    historicalConsumptions,

    consumption_queries,

    subscribeToRealTimeMetersUpdates,
    subscribeToActiveSmartFurnitureHookups,
    setRealTimeConsumptionsQuery,
    setHistoricalConsumptionsQuery,
    subscribeToUtilityConsumptions,
    updateRealTimeQuery,
    updateHistoricalQuery,
    disconnectMonitoring,

    unsubscribeFromRealTimeMetersUpdates,
    unsubscribeFromActiveSmartFurnitureHookups,
    unsubscribeFromUtilityConsumptions,
  };
});
