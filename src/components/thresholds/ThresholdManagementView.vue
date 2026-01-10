<script setup>
import { ref, onMounted, computed } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useThresholdStore } from "@/stores/thresholdStore";
import ThresholdListTable from "@/components/thresholds/ThresholdListTable.vue";
import ThresholdFormDialog from "@/components/thresholds/ThresholdFormDialog.vue";
import { confirmDeleteDialog } from "@/utils/ui/confirmPresets.js";

const props = defineProps({
  isLocalMode: {
    type: Boolean,
    default: false,
  },
});

const confirm = useConfirm();
const thresholdStore = useThresholdStore();

const dialog = ref(false);
const threshold = ref({});
const selectedThresholds = ref([]);
const submitted = ref(false);

onMounted(() => {
  thresholdStore.setLocalMode(props.isLocalMode);
});

const statusOptions = computed(() => {
  return !threshold.value.id
    ? thresholdStore.staticOptions._allStatuses.filter((s) => s !== "BREACHED")
    : thresholdStore.staticOptions._allStatuses;
});

const isPeriodDisabled = computed(
  () => threshold.value.thresholdType === "ACTUAL",
);

const openNew = () => {
  threshold.value = { thresholdState: "ENABLED" };
  submitted.value = false;
  dialog.value = true;
};

const hideDialog = () => {
  dialog.value = false;
  submitted.value = false;
};

const openEdit = (item) => {
  threshold.value = { ...item };
  dialog.value = true;
};

const handleTypeChange = () => {
  if (threshold.value.thresholdType === "ACTUAL") {
    threshold.value.periodType = "";
  }
};

const saveThreshold = async () => {
  submitted.value = true;
  const { name, utilityType, thresholdType, value: tValue } = threshold.value;

  if (
    !name?.trim() ||
    !utilityType ||
    !thresholdType ||
    tValue == null ||
    Number(tValue) <= 0
  ) {
    return;
  }

  const payload = { ...threshold.value };
  if (payload.thresholdType === "ACTUAL" || !payload.periodType) {
    payload.periodType = "";
  }

  let success = false;
  if (payload.id) {
    success = await thresholdStore.updateThreshold(payload.id, payload);
  } else {
    success = await thresholdStore.createThreshold(payload);
  }

  if (success) {
    hideDialog();
  }
};

const toggleStatus = async (item) => {
  const newState = item.thresholdState === "ENABLED" ? "DISABLED" : "ENABLED";
  const updatedItem = { ...item, thresholdState: newState };
  await thresholdStore.updateThreshold(item.id, updatedItem);
};

const confirmDelete = (item) => {
  confirm.require(
    confirmDeleteDialog({
      message: `Delete threshold "${item.name}"?`,
      header: "Delete Threshold",
      onAccept: async () => {
        const success = await thresholdStore.deleteThreshold(item.id);
        if (success) {
          selectedThresholds.value = selectedThresholds.value.filter(
            (t) => t.id !== item.id,
          );
        }
      },
    }),
  );
};

const confirmDeleteSelected = () => {
  confirm.require(
    confirmDeleteDialog({
      message: "Delete selected thresholds?",
      header: "Delete Thresholds",
      onAccept: async () => {
        const ids = selectedThresholds.value.map((t) => t.id);
        const success = await thresholdStore.deleteThresholds(ids);
        if (success) {
          selectedThresholds.value = [];
        }
      },
    }),
  );
};
</script>

<template>
  <div class="card">
    <div v-if="$slots.header" class="mb-4">
      <slot name="header"></slot>
    </div>

    <ThresholdListTable
      :thresholds="thresholdStore.thresholds"
      :loading="thresholdStore.isLoading"
      v-model:selection="selectedThresholds"
      @create="openNew"
      @edit="openEdit"
      @delete="confirmDelete"
      @delete-selected="confirmDeleteSelected"
      @toggle-status="toggleStatus"
    />

    <ThresholdFormDialog
      v-model:visible="dialog"
      v-model:threshold="threshold"
      :submitted="submitted"
      :loading="thresholdStore.isLoading"
      :options="thresholdStore.staticOptions"
      :status-options="statusOptions"
      :is-period-disabled="isPeriodDisabled"
      @save="saveThreshold"
      @cancel="hideDialog"
      @type-change="handleTypeChange"
    />
  </div>
</template>
