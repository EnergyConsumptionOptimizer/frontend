<script setup>
import { onMounted } from "vue";
import { useForecastStore } from "@/stores/forecastStore";
import { useForecastChart } from "@/composables/useForecastChart";
import ConsumptionForecastChart from "@/components/charts/ConsumptionForecastChart.vue";

const PERIOD_OPTIONS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const UTILITIES = [
  { id: "ELECTRICITY", title: "Electricity" },
  { id: "GAS", title: "Gas" },
  { id: "WATER", title: "Water" },
];

const charts = UTILITIES.map((u) => {
  const logic = useForecastChart(u.id);
  return { ...u, ...logic };
});

const store = useForecastStore();

onMounted(() => {
  store.fetchAll();
});
</script>

<template>
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12">
      <h1 class="text-3xl font-bold mb-2">Consumption Forecasts</h1>
    </div>

    <div
      v-for="chart in charts"
      :key="chart.id"
      class="col-span-12 xl:col-span-6"
    >
      <ConsumptionForecastChart
        :title="chart.title"
        :labels="chart.chartData.value.labels"
        :values="chart.chartData.value.values"
        :loading="chart.loading.value"
        :periods="PERIOD_OPTIONS"
        @period-change="chart.setPeriod"
      />
    </div>
  </div>
</template>
