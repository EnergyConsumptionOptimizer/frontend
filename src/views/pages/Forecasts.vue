<script setup>
import { onMounted } from "vue";
import ConsumptionForecastChart from "@/components/charts/ConsumptionForecastChart.vue";
import { useForecast } from "@/composables/useForecast";

const UTILITY_CONFIG = [
  { id: "ELECTRICITY", title: "Electricity" },
  { id: "GAS", title: "Gas" },
  { id: "WATER", title: "Water" },
];

const charts = UTILITY_CONFIG.map((config) => {
  const logic = useForecast(config.id);
  return {
    ...config,
    ...logic,
  };
});

onMounted(() => {
  charts.forEach((chart) => chart.fetchForecast());
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
        :labels="chart.data.labels"
        :values="chart.data.values"
        :loading="chart.loading.value"
        @period-change="chart.fetchForecast"
      />
    </div>
  </div>
</template>
