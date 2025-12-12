import { reactive, ref } from "vue";
import { MockConsumptionService } from "@/service/mock/MockConsumptionService";

export function useChartData() {
  const data = reactive({ labels: [], values: [] });
  const loading = ref(false);

  const fetchData = async (filters) => {
    loading.value = true;
    try {
      const res = await MockConsumptionService.getConsumptions(filters);
      data.labels = res.labels;
      data.values = res.values;
    } catch (err) {
      console.error("Chart Error:", err);
    } finally {
      loading.value = false;
    }
  };

  return { data, loading, fetchData };
}
