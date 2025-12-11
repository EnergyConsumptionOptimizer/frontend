import { reactive, ref } from "vue";
import { MockedUserService } from "@/service/MockedUserService";

export function useChartData() {
  const data = reactive({ labels: [], values: [] });
  const loading = ref(false);

  const fetchData = async (filters) => {
    loading.value = true;
    try {
      const res = await MockedUserService.getConsumptions(filters);
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
