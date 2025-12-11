import { onUnmounted } from "vue";
import { ConsumptionService } from "@/service/ConsumptionService";
import { useChartData } from "./useChart";

export function useRealTimeChart() {
  const { data, loading } = useChartData();
  let timer = null;

  const startPolling = async (filters) => {
    if (timer) clearInterval(timer);

    loading.value = true;
    try {
      const res = await ConsumptionService.getConsumptions(filters);
      data.labels = res.labels;
      data.values = res.values;

      timer = setInterval(async () => {
        const lastVal = data.values[data.values.length - 1];
        const point = await ConsumptionService.getNextValue(
          lastVal,
          filters.utility,
        );

        data.labels = [...data.labels.slice(1), point.label];
        data.values = [...data.values.slice(1), point.value];
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return { data, loading, startPolling };
}
