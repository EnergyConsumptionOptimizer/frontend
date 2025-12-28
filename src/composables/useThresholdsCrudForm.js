import { ref, computed, toRaw } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { ThresholdService } from "@/service/ThresholdService";

const STATIC_OPTIONS = Object.freeze({
  utilities: ["GAS", "WATER", "ELECTRICITY"],
  types: ["HISTORICAL", "ACTUAL", "FORECAST"],
  periods: ["ONE_DAY", "ONE_WEEK", "ONE_MONTH"],
  _allStatuses: ["ENABLED", "DISABLED", "BREACHED"],
});

export function useThresholdsCrudForm() {
  const toast = useToast();
  const confirm = useConfirm();

  const thresholds = ref([]);
  const threshold = ref({});
  const selectedThresholds = ref([]);
  const loading = ref(false);
  const dialog = ref(false);
  const submitted = ref(false);

  const statusOptions = computed(() => {
    return !threshold.value.id
      ? STATIC_OPTIONS._allStatuses.filter((s) => s !== "BREACHED")
      : STATIC_OPTIONS._allStatuses;
  });

  const isPeriodDisabled = computed(
    () => threshold.value.thresholdType === "ACTUAL",
  );

  const executeAsync = async (action, successMsg) => {
    loading.value = true;
    try {
      await action();
      if (successMsg) {
        toast.add({
          severity: "success",
          summary: "Success",
          detail: successMsg,
          life: 3000,
        });
      }
    } catch (err) {
      console.error(err);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Operation Failed",
        life: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  const loadThresholds = () =>
    executeAsync(async () => {
      thresholds.value = await ThresholdService.getThresholds();
    });

  const createThreshold = async (payload) => {
    await executeAsync(async () => {
      const result = await ThresholdService.createThreshold(payload);
      thresholds.value.push(result);
      dialog.value = false;
      threshold.value = {};
    }, "Threshold Created");
  };

  const updateThreshold = async (payload) => {
    await executeAsync(async () => {
      const result = await ThresholdService.updateThreshold(
        payload.id,
        payload,
      );
      const index = thresholds.value.findIndex((t) => t.id === result.id);
      if (index !== -1) thresholds.value[index] = result;
      dialog.value = false;
      threshold.value = {};
    }, "Threshold Updated");
  };

  const saveThreshold = () => {
    submitted.value = true;
    const {
      name,
      utilityType,
      thresholdType,
      value: thresholdValue,
    } = threshold.value;

    if (!name || !name.trim()) return;
    if (!utilityType || !thresholdType) return;
    if (thresholdValue == null || Number(thresholdValue) <= 0) return;

    const payload = { ...threshold.value };

    if (payload.thresholdType === "ACTUAL" || !payload.periodType) {
      delete payload.periodType;
    }

    if (payload.id) {
      updateThreshold(payload);
    } else {
      createThreshold(payload);
    }
  };

  const toggleStatus = (item) => {
    const newState = item.thresholdState === "ENABLED" ? "DISABLED" : "ENABLED";
    const updatedItem = { ...item, thresholdState: newState };

    executeAsync(async () => {
      await ThresholdService.updateThreshold(item.id, updatedItem);
      const idx = thresholds.value.findIndex((t) => t.id === item.id);
      if (idx !== -1) thresholds.value[idx] = updatedItem;
    });
  };

  const confirmDelete = (item) => {
    confirm.require({
      message: `Delete threshold "${item.name}"?`,
      header: "Confirm",
      icon: "pi pi-exclamation-triangle",
      acceptClass: "p-button-danger",
      accept: () =>
        executeAsync(async () => {
          await ThresholdService.deleteThreshold(item.id);
          thresholds.value = thresholds.value.filter((t) => t.id !== item.id);
        }, "Threshold Deleted"),
    });
  };

  const confirmDeleteSelected = () => {
    confirm.require({
      message: "Delete selected thresholds?",
      header: "Confirm",
      icon: "pi pi-exclamation-triangle",
      acceptClass: "p-button-danger",
      accept: () =>
        executeAsync(async () => {
          const ids = selectedThresholds.value.map((t) => t.id);
          thresholds.value = thresholds.value.filter(
            (t) => !ids.includes(t.id),
          );
          selectedThresholds.value = [];
        }, "Thresholds Deleted"),
    });
  };

  const openNew = () => {
    threshold.value = { thresholdState: "ENABLED" };
    submitted.value = false;
    dialog.value = true;
  };

  const openEdit = (item) => {
    threshold.value = structuredClone(toRaw(item));
    dialog.value = true;
  };

  const hideDialog = () => {
    dialog.value = false;
    submitted.value = false;
  };

  const handleTypeChange = () => {
    if (threshold.value.thresholdType === "ACTUAL") {
      threshold.value.periodType = "";
    }
  };

  return {
    thresholds,
    threshold,
    selectedThresholds,
    loading,
    dialog,
    submitted,
    options: STATIC_OPTIONS,
    statusOptions,
    isPeriodDisabled,
    loadThresholds,
    saveThreshold,
    toggleStatus,
    confirmDelete,
    confirmDeleteSelected,
    openNew,
    openEdit,
    hideDialog,
    handleTypeChange,
  };
}
