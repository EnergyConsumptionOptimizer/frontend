<script setup>
import StatsCard from "@/components/common/StatsCard.vue";
import ChartRealTime from "@/components/charts/ConsumptionRealTimeChart.vue";
import ChartHistorical from "@/components/charts/ConsumptionHistoryChart.vue";
import ChartFiltered from "@/components/charts/ConsumptionDistributionChart.vue";
import IconElectricity from "@/assets/icons/electricity.svg?component";
import IconGas from "@/assets/icons/gas.svg?component";
import IconWater from "@/assets/icons/water.svg?component";

import { useDashboardContext } from "@/composables/useDashboard";
import { useRealTimeChart } from "@/composables/useRealTime";
import { useChartData } from "@/composables/useChartConfig";

const CONFIG = {
  utilities: ["Electricity", "Gas", "Water"],
  timeRanges: [
    { label: "1 Day", value: "1d" },
    { label: "5 Days", value: "5d" },
    { label: "1 Month", value: "1mo" },
    { label: "All", value: "all" },
  ],
  granularities: [
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

const { usersList, zonesList, colors } = useDashboardContext();
const rtChart = useRealTimeChart();
const histChart = useChartData();
const filtChart = useChartData();
</script>

<template>
  <h1>Dashboard</h1>
  <Fluid class="grid grid-cols-12 gap-8">
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <StatsCard
        label="Electricity"
        value="14.41"
        unit="kWh"
        :color="colors.electricity"
      >
        <template #icon
          ><IconElectricity class="w-7 h-7 fill-current"
        /></template>
      </StatsCard>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <StatsCard label="Gas" value="14.41" unit="Smc" :color="colors.gas">
        <template #icon><IconGas class="w-7 h-7 fill-current" /></template>
      </StatsCard>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <StatsCard label="Water" value="14.41" unit="Smc" :color="colors.water">
        <template #icon><IconWater class="w-7 h-7 fill-current" /></template>
      </StatsCard>
    </div>

    <div class="col-span-12 xl:col-span-6">
      <ChartRealTime
        :users="usersList"
        :zones="zonesList"
        :utilities="CONFIG.utilities"
        :time-ranges="CONFIG.timeRanges"
        :granularities="CONFIG.granularities"
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
      <ChartFiltered
        :users="usersList"
        :zones="zonesList"
        :utilities="CONFIG.utilities"
        :time-ranges="CONFIG.timeRanges"
        :labels="filtChart.data.labels"
        :values="filtChart.data.values"
        :loading="filtChart.loading.value"
        @filter-change="filtChart.fetchData"
      />
    </div>
  </Fluid>
</template>
