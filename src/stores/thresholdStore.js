import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ThresholdApiService } from "@/service/ThresholdApiService";
import { ThresholdLocalService } from "@/service/local/ThresholdLocalService";
import { useAsyncAction } from "@/composables/utils/asyncAction";

export const useThresholdStore = defineStore("threshold", () => {
  const thresholds = ref([]);
  const isLocalMode = ref(false);
  const { isLoading, error, perform } = useAsyncAction();

  const staticOptions = {
    utilities: ["GAS", "WATER", "ELECTRICITY"],
    types: ["HISTORICAL", "ACTUAL", "FORECAST"],
    periods: ["ONE_DAY", "ONE_WEEK", "ONE_MONTH"],
    _allStatuses: ["ENABLED", "DISABLED", "BREACHED"],
  };

  const activeService = computed(() =>
    isLocalMode.value ? ThresholdLocalService : ThresholdApiService,
  );

  const setLocalMode = (active) => {
    isLocalMode.value = active;
    thresholds.value = [];
    fetchThresholds();
  };

  const fetchThresholds = () =>
    perform(async () => {
      thresholds.value = await activeService.value.getThresholds();
    });

  const createThreshold = (payload) =>
    perform(async () => {
      const result = await activeService.value.createThreshold(payload);
      thresholds.value.push(result);
    });

  const updateThreshold = (id, payload) =>
    perform(async () => {
      const result = await activeService.value.updateThreshold(id, payload);
      const index = thresholds.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        thresholds.value[index] = result;
      }
    });

  const deleteThreshold = (id) =>
    perform(async () => {
      await activeService.value.deleteThreshold(id);
      thresholds.value = thresholds.value.filter((t) => t.id !== id);
    });

  const deleteThresholds = (ids) =>
    perform(async () => {
      await Promise.all(
        ids.map((id) => activeService.value.deleteThreshold(id)),
      );
      thresholds.value = thresholds.value.filter((t) => !ids.includes(t.id));
    });

  const syncAndFinalize = () =>
    perform(async () => {
      if (!isLocalMode.value) return;

      const localThresholds = await ThresholdLocalService.getThresholds();

      const promises = localThresholds.map(({ ...payload }) =>
        ThresholdApiService.createThreshold(payload),
      );

      const createdThresholds = await Promise.all(promises);

      ThresholdLocalService.clear();
      isLocalMode.value = false;
      thresholds.value = createdThresholds;
      return true;
    });

  return {
    thresholds,
    isLoading,
    error,
    staticOptions,
    isLocalMode,
    setLocalMode,
    syncAndFinalize,
    fetchThresholds,
    createThreshold,
    updateThreshold,
    deleteThreshold,
    deleteThresholds,
  };
});
