import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useForecastStore } from "@/stores/forecastStore";
import { aggregateForecastData } from "@/utils/forecastUtils";

export function useForecastChart(utilityType) {
  const store = useForecastStore();
  const { loading } = storeToRefs(store);

  const period = ref({ label: "Daily", value: "daily" });

  const chartData = computed(() => {
    const rawData = store.getByUtility(utilityType);
    return aggregateForecastData(rawData?.dataPoints, period.value.value);
  });

  const setPeriod = (newPeriod) => {
    period.value = newPeriod;
  };

  return {
    period,
    chartData,
    loading,
    setPeriod,
  };
}
