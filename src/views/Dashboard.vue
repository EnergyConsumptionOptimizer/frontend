<script setup>
import StatsCard from "@/components/common/StatsCard.vue";
import { computed, onMounted, onUnmounted } from "vue";
import { useMonitoringStore } from "@/stores/monitoringStore.js";
import { storeToRefs } from "pinia";
import ConsumptionRealTimeChart from "@/components/charts/ConsumptionRealTimeChart.vue";
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";
import { useUserStore } from "@/stores/userStore.js";
import { useAsyncAction } from "@/composables/utils/asyncAction.js";
import { computeUtilityConsumptionStatsCards } from "@/utils/utilityConsumptionStatsCards.js";
import StaticMap from "@/components/interactiveMap/StaticMap.vue";
import ConsumptionHistoryChart from "@/components/charts/ConsumptionHistoryChart.vue";

const monitoringStore = useMonitoringStore();
const interactiveMapStore = useInteractiveMapStore();
const userStore = useUserStore();

const { realTimeConsumptions, historicalConsumptions } =
  storeToRefs(monitoringStore);

const { zones } = storeToRefs(interactiveMapStore);

const { users } = storeToRefs(userStore);

const usersFilterOptions = computed(() => [
  { label: "All Users", value: "all" },
  ...users.value.map((u) => ({ label: u.username, value: u.username })),
]);

const zonesFilterOptions = computed(() => [
  { label: "All Zones", value: "all" },
  ...zones.value.map((z) => ({ label: z.name, value: z.id })),
]);

const consumptionStatsCards = computed(() =>
  computeUtilityConsumptionStatsCards(monitoringStore.meters),
);

const RT_CONFIG = {
  "1hour": {
    label: "This Hour",
    granularities: [
      { label: "1 Minute", value: "1minute" },
      { label: "5 Minutes", value: "5minutes" },
      { label: "10 Minutes", value: "10minutes" },
    ],
  },
  "1day": {
    label: "Today",
    granularities: [
      { label: "5 Minutes", value: "5minutes" },
      { label: "1 Hour", value: "1hour" },
    ],
  },
  "5days": {
    label: "5 Days",
    granularities: [
      { label: "5 Minutes", value: "5minutes" },
      { label: "1 Hour", value: "1hour" },
      { label: "1 Day", value: "1day" },
    ],
  },
  "1month": {
    label: "This Month",
    granularities: [
      { label: "12 Hours", value: "12hours" },
      { label: "1 Day", value: "1day" },
    ],
  },
};

const HIST_CONFIG = {
  "1day": {
    label: "Daily",
    granularities: [{ value: "1hour" }],
  },
  "1month": {
    label: "Monthly",
    granularities: [{ value: "1day" }],
  },
  "1year": {
    label: "Yearly",
    granularities: [{ value: "1month" }],
  },
};

const UTILITIES = ["Electricity", "Gas", "Water"];

async function updateRealTimeFilter(filter) {
  await perform(async () => {
    await monitoringStore.updateRealTimeQuery(
      filter.utility,
      filter.time,
      filter.granularity.value,
      filter.user.value,
      filter.zone.value,
    );
  });
}

async function updateHistoricalFilter(filter) {
  await perform(async () => {
    await monitoringStore.updateHistoricalQuery(
      filter.utility,
      filter.time,
      filter.granularity.value,
      filter.user.value,
      filter.zone.value,
    );
  });
}

const { isLoading, perform } = useAsyncAction();

onMounted(async () => {
  userStore.setLocalMode(false);
  const defaultRTKey = Object.keys(RT_CONFIG)[0];
  const defaultHistKey = Object.keys(HIST_CONFIG)[0];

  monitoringStore.setRealTimeConsumptionsQuery(
    UTILITIES[0],
    defaultRTKey,
    RT_CONFIG[defaultRTKey].granularities[0].value,
  );
  monitoringStore.setHistoricalConsumptionsQuery(
    UTILITIES[0],
    defaultHistKey,
    HIST_CONFIG[defaultHistKey].granularities[0].value,
  );

  await Promise.allSettled([
    userStore.fetchUsers(),
    interactiveMapStore.setLocalMode(false),
    monitoringStore.subscribeToRealTimeMetersUpdates(),
    perform(async () => {
      await monitoringStore.subscribeToUtilityConsumptions();
    }),
  ]);
});

onUnmounted(() => {
  console.log("View unmounting, closing sockets...");
  monitoringStore.disconnectMonitoring();
});
</script>

<template>
  <h1>Dashboard</h1>

  <Fluid class="grid grid-cols-12 gap-8">
    <div
      v-for="card in consumptionStatsCards"
      :key="card.label"
      class="col-span-12 md:col-span-6 lg:col-span-4"
    >
      <StatsCard
        :label="card.label"
        :value="card.value"
        :unit="card.unit"
        :color="`var(${card.colorVar})`"
      >
        <template #icon>
          <component :is="card.icon" class="w-7 h-7 fill-current" />
        </template>
      </StatsCard>
    </div>

    <div class="col-span-12 xl:col-span-6">
      <consumption-real-time-chart
        :users="usersFilterOptions"
        :zones="zonesFilterOptions"
        :utilities="UTILITIES"
        :time-filter-config="RT_CONFIG"
        :consumptionSeries="realTimeConsumptions"
        :loading="isLoading"
        @filter-change="updateRealTimeFilter"
      />
    </div>
    <div class="col-span-12 xl:col-span-6 min-w-0">
      <consumption-history-chart
        :users="usersFilterOptions"
        :zones="zonesFilterOptions"
        :utilities="UTILITIES"
        :time-filter-config="HIST_CONFIG"
        :consumptionSeries="historicalConsumptions"
        :loading="isLoading"
        @filter-change="updateHistoricalFilter"
      />
    </div>
    <div class="col-span-12 xl:col-span-6">
      <div class="card h-full flex flex-col">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-semibold m-0">House Map</h3>
        </div>
        <static-map />
      </div>
    </div>
  </Fluid>
</template>
