import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ForecastService } from "@/service/ForecastService";

export const useForecastStore = defineStore("forecast", () => {
  const items = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const lastFetched = ref(null);

  const getByUtility = computed(() => (utilityType) => {
    return items.value.find((f) => f.utilityType === utilityType);
  });

  const fetchAll = async (force = false) => {
    if (!force && items.value.length > 0) return;

    isLoading.value = true;
    error.value = null;

    try {
      items.value = await ForecastService.getForecasts();
      lastFetched.value = Date.now();
    } catch (err) {
      console.error("Error fetching forecasts:", err);
      error.value = err;
      items.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    items,
    isLoading,
    error,
    lastFetched,
    getByUtility,
    fetchAll,
  };
});
