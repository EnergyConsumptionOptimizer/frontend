import { reactive, ref } from "vue";
import { MockConsumptionService } from "@/service/mock/MockConsumptionService";

export function useForecast(utilityName) {
  const data = reactive({ labels: [], values: [] });
  const loading = ref(false);

  const currentPeriod = ref({ label: "Daily", value: "daily" });

  const fetchForecast = async (periodOption) => {
    if (periodOption) currentPeriod.value = periodOption;

    loading.value = true;
    try {
      const res = await MockConsumptionService.getForecast({
        utility: utilityName,
        period: currentPeriod.value.value,
      });

      data.labels = res.labels;
      data.values = res.values;
    } catch (err) {
      console.error(`Forecast Error (${utilityName}):`, err);
    } finally {
      loading.value = false;
    }
  };

  return {
    data,
    loading,
    fetchForecast,
    currentPeriod,
  };
}
