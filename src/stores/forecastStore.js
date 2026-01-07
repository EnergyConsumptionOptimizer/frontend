import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ForecastService } from "@/service/ForecastService";
import { useAsyncAction } from "@/composables/utils/asyncAction";

export const useForecastStore = defineStore("forecast", () => {
  const items = ref([]);
  const lastFetched = ref(null);

  const { isLoading, error, perform } = useAsyncAction();

  const getByUtility = computed(() => (utilityType) => {
    return items.value.find((f) => f.utilityType === utilityType);
  });

  const fetchAll = async (force = false) => {
    if (!force && items.value.length > 0) return;

    const success = await perform(async () => {
      items.value = await ForecastService.getForecasts();
      lastFetched.value = Date.now();
    });
    if (!success) {
      items.value = [];
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
