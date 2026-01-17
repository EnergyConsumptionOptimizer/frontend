<script setup>
import StatsCard from "@/components/common/StatsCard.vue";
import ChartRealTime from "@/components/charts/ConsumptionRealTimeChart.vue";
import ChartHistorical from "@/components/charts/ConsumptionHistoryChart.vue";

import IconElectricity from "@/assets/icons/electricity.svg?component";
import IconGas from "@/assets/icons/gas.svg?component";
import IconWater from "@/assets/icons/water.svg?component";

import { DOMAIN_COLORS } from "@/config/chartPalette";
import { useDashboardContext } from "@/composables/useDashboard";
import { useRealTimeChart } from "@/composables/useRealTime";
import { useChartData } from "@/composables/charts/useChartData";
import { computed, onMounted } from "vue";
import StaticMap from "@/components/interactiveMap/StaticMap.vue";
import { useMonitoringStore } from "@/stores/monitoringStore.js";

const monitoringStore = useMonitoringStore();

const CONFIG = {
  utilities: ["Electricity", "Gas", "Water"],
  timeRanges: [
    { label: "1 Day", value: "1d" },
    { label: "5 Days", value: "5d" },
    { label: "1 Month", value: "1mo" },
    { label: "All", value: "all" },
  ],
  rtGranularities: [
    { label: "5 Min", value: "5m" },
    { label: "1 Hour", value: "1h" },
    { label: "1 Day", value: "1d" },
  ],
  histGranularities: [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
  ],
};

const { usersList, zonesList } = useDashboardContext();

const rtChart = useRealTimeChart();
const histChart = useChartData();

const statsCards = computed(() => {
  return [
    {
      label: "Gas",
      value: monitoringStore.meters.gas?.value?.toString() || "-",
      unit: monitoringStore.meters.gas?.utilityConsumptionUnit || "Smc",
      colorVar: DOMAIN_COLORS.gas,
      icon: IconGas,
    },
    {
      label: "Water",
      value: monitoringStore.meters.water?.value?.toString() || "-",
      unit: monitoringStore.meters.water?.utilityConsumptionUnit || "Smc",
      colorVar: DOMAIN_COLORS.water,
      icon: IconWater,
    },
    {
      label: "Electricity",
      value: monitoringStore.meters.electricity?.value?.toString() || "-",
      unit: monitoringStore.meters.electricity?.utilityConsumptionUnit || "kWh",
      colorVar: DOMAIN_COLORS.electricity,
      icon: IconElectricity,
    },
  ];
});

onMounted(() => {
  monitoringStore.subscribeToRealTimeMetersUpdates();
});
</script>

<template>
  <h1>Dashboard</h1>

  <Fluid class="grid grid-cols-12 gap-8">
    <div
      v-for="card in statsCards"
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
      <ChartRealTime
        :users="usersList"
        :zones="zonesList"
        :utilities="CONFIG.utilities"
        :time-ranges="CONFIG.timeRanges"
        :granularities="CONFIG.rtGranularities"
        :labels="rtChart.data.labels"
        :values="rtChart.data.values"
        :loading="rtChart.loading.value"
        @filter-change="rtChart.startPolling"
      />
    </div>
    <div class="col-span-12 xl:col-span-6">
      <ChartHistorical
        :users="usersList"
        :zones="zonesList"
        :utilities="CONFIG.utilities"
        :granularities="CONFIG.histGranularities"
        :labels="histChart.data.labels"
        :values="histChart.data.values"
        :loading="histChart.loading.value"
        @filter-change="histChart.fetchData"
      />
    </div>
    <div class="col-span-12 xl:col-span-6">
      <div class="card h-full flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold m-0">House Map</h3>
        </div>
        <static-map />
      </div>
    </div>
  </Fluid>
</template>
