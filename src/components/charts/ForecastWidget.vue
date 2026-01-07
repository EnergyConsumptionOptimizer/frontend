<script setup>
import { ref, computed } from "vue";
import { useForecastStore } from "@/stores/forecastStore";
import { aggregateForecastData } from "@/utils/forecastUtils";
import ConsumptionForecastChart from "@/components/charts/ConsumptionForecastChart.vue";

const props = defineProps({
  utilityType: { type: String, required: true },
  title: { type: String, required: true },
});

const store = useForecastStore();

const PERIOD_OPTIONS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const period = ref({ label: "Daily", value: "daily" });

const chartData = computed(() => {
  const rawData = store.getByUtility(props.utilityType);
  return aggregateForecastData(rawData?.dataPoints, period.value.value);
});

const setPeriod = (newPeriod) => {
  period.value = newPeriod;
};
</script>

<template>
  <ConsumptionForecastChart
    :title="title"
    :labels="chartData.labels"
    :values="chartData.values"
    :loading="store.isLoading"
    :periods="PERIOD_OPTIONS"
    @period-change="setPeriod"
  />
</template>
