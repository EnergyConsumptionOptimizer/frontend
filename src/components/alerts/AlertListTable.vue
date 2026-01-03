<script setup>
import { ref } from "vue";
import { format } from "date-fns";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";

defineProps({
  alerts: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "mark-read",
  "delete",
  "refresh",
  "mark-read-bulk",
  "delete-bulk",
]);

const selectedAlerts = ref([]);

const formatDate = (dateString) => {
  if (!dateString) return "";
  return format(new Date(dateString), "PPpp");
};

const getMessage = (alert) => {
  if (alert?.details) {
    const { thresholdName, detectedValue, limitValue } = alert.details;
    return `${thresholdName}: Detected ${detectedValue} (Limit: ${limitValue})`;
  }
  return alert?.message ?? "";
};

const rowClass = (data) => {
  return [{ "bg-blue-50 dark:bg-blue-900/20": !data.read }];
};

const onBulkAction = (action) => {
  if (selectedAlerts.value.length === 0) return;
  emit(action, [...selectedAlerts.value]);
  selectedAlerts.value = [];
};
</script>

<template>
  <div class="card">
    <DataTable
      v-model:selection="selectedAlerts"
      :value="alerts"
      dataKey="id"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      :loading="loading"
      :rowClass="rowClass"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h4 class="m-0">Alerts</h4>
            <div v-if="selectedAlerts.length > 0" class="flex gap-2 ml-4">
              <Button
                label="Mark as Read"
                icon="pi pi-check"
                size="small"
                severity="success"
                outlined
                @click="onBulkAction('mark-read-bulk')"
              />
              <Button
                label="Delete Selected"
                icon="pi pi-trash"
                size="small"
                severity="danger"
                outlined
                @click="onBulkAction('delete-bulk')"
              />
            </div>
          </div>
          <Button icon="pi pi-refresh" text rounded @click="$emit('refresh')" />
        </div>
      </template>

      <template #empty>
        <span class="text-surface-500 dark:text-surface-400"
          >No alerts available.</span
        >
      </template>

      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

      <Column header="Date" sortable field="createdAt" style="width: 14rem">
        <template #body="{ data }">
          <span class="text-sm text-surface-500 dark:text-surface-400">
            {{ formatDate(data.createdAt) }}
          </span>
        </template>
      </Column>

      <Column header="Status" field="read" sortable style="width: 8rem">
        <template #body="{ data }">
          <Tag
            :severity="!data.read ? 'info' : 'success'"
            :value="!data.read ? 'New' : 'Read'"
          />
        </template>
      </Column>

      <Column header="Message">
        <template #body="{ data }">
          <span class="text-surface-900 dark:text-surface-0">
            {{ getMessage(data) }}
          </span>
        </template>
      </Column>

      <Column header="Actions" style="width: 8rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              v-tooltip.top="'Delete'"
              @click="$emit('delete', data)"
            />
            <Button
              v-if="!data.read"
              icon="pi pi-check"
              text
              rounded
              severity="success"
              v-tooltip.top="'Mark as read'"
              @click="$emit('mark-read', data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
