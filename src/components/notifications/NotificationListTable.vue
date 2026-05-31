<script setup>
import { ref } from "vue";
import { format } from "date-fns";
import { FilterMatchMode } from "@primevue/core/api";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import CrudToolbar from "@/components/common/CrudToolbar.vue";

defineProps({
  notifications: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const selectedNotifications = defineModel("selection", { default: () => [] });

const emit = defineEmits([
  "mark-read",
  "delete",
  "mark-read-bulk",
  "delete-bulk",
  "refresh",
]);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  return format(new Date(dateString), "PPpp");
};

const getMessage = (notification) => {
  if (notification?.details) {
    const { thresholdName, detected, limit } = notification.details;
    return `${thresholdName}: Detected ${detected} (Limit: ${limit})`;
  }
  return notification?.message ?? "";
};

const rowClass = (data) => {
  return [{ "bg-blue-50/50 dark:bg-blue-900/10": !data.isRead }];
};

const onBulkAction = (action) => {
  if (selectedNotifications.value.length === 0) return;
  emit(action, [...selectedNotifications.value]);
  selectedNotifications.value = [];
};
</script>

<template>
  <div>
    <CrudToolbar
      :selected-items="selectedNotifications"
      delete-label="Mark Read"
      delete-icon="pi pi-check"
      delete-severity="success"
      :show-create="false"
      @delete-selected="onBulkAction('mark-read-bulk')"
    >
      <template #extra-actions>
        <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          :outlined="selectedNotifications.length === 0"
          class="min-h-11"
          :disabled="selectedNotifications.length === 0"
          :aria-label="
            selectedNotifications.length > 0
              ? `Delete ${selectedNotifications.length} selected notifications`
              : 'Delete selected notifications (none selected)'
          "
          @click="onBulkAction('delete-bulk')"
        />
      </template>
    </CrudToolbar>

    <DataTable
      v-model:selection="selectedNotifications"
      :value="notifications"
      dataKey="id"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20]"
      :filters="filters"
      :globalFilterFields="['message', 'details.thresholdName']"
      :loading="loading"
      :rowClass="rowClass"
      responsiveLayout="scroll"
      aria-label="Notifications table"
    >
      <template #header>
        <div
          class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between"
        >
          <h2 class="m-0 text-xl sm:text-2xl font-semibold">Notifications</h2>
          <IconField>
            <InputIcon><i class="pi pi-search" aria-hidden="true" /></InputIcon>
            <InputText
              v-model="filters['global'].value"
              placeholder="Search notifications..."
              class="min-h-11"
              aria-label="Search notifications by message or threshold name"
            />
          </IconField>
        </div>
      </template>

      <template #empty>
        <div class="text-center p-4 text-surface-500 dark:text-surface-400">
          No notifications available.
        </div>
      </template>

      <Column
        selectionMode="multiple"
        headerStyle="width: 3rem"
        :exportable="false"
      />

      <Column header="Date" sortable field="createdAt" style="min-width: 12rem">
        <template #body="{ data }">
          <span class="whitespace-nowrap">
            {{ formatDate(data.createdAt) }}
          </span>
        </template>
      </Column>

      <Column header="Status" field="isRead" sortable style="min-width: 8rem">
        <template #body="{ data }">
          <Tag
            :severity="!data.isRead ? 'info' : 'success'"
            :value="!data.isRead ? 'New' : 'Read'"
            class="uppercase text-xs"
            :aria-label="
              !data.isRead ? 'Unread notification' : 'Read notification'
            "
          />
        </template>
      </Column>

      <Column header="Message" style="min-width: 16rem">
        <template #body="{ data }">
          <span
            class="text-surface-900 dark:text-surface-0 break-words line-clamp-2"
            :title="getMessage(data)"
          >
            {{ getMessage(data) }}
          </span>
        </template>
      </Column>

      <Column header="Actions" style="min-width: 10rem" :exportable="false">
        <template #body="{ data }">
          <span hidden data-testid="notification-source-id">{{
            data.sourceId
          }}</span>
          <div class="flex gap-2">
            <div class="w-11">
              <Button
                v-if="!data.isRead"
                icon="pi pi-check"
                rounded
                severity="success"
                class="min-w-11 min-h-11"
                aria-label="Mark as read"
                v-tooltip.top="'Mark as read'"
                @click="$emit('mark-read', data)"
              />
            </div>
            <Button
              icon="pi pi-trash"
              rounded
              severity="danger"
              class="min-w-11 min-h-11"
              aria-label="Delete notification"
              v-tooltip.top="'Delete'"
              @click="$emit('delete', data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
