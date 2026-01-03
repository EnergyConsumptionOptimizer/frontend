<script setup>
import { useAlertStore } from "@/stores/alertStore";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import AlertListTable from "@/components/alerts/AlertListTable.vue";

const alertStore = useAlertStore();
const { alerts, isLoading } = storeToRefs(alertStore);

onMounted(() => {
  alertStore.sync();
});

const markAsRead = (alert) => {
  alertStore.markAsRead(alert.id);
};

const deleteAlert = (alert) => {
  alertStore.deleteAlert(alert.id);
};

const refresh = () => {
  alertStore.sync();
};

const markAsReadBulk = (alerts) => {
  const ids = alerts.map((a) => a.id);
  alertStore.markManyAsRead(ids);
};

const deleteBulk = (alerts) => {
  const ids = alerts.map((a) => a.id);
  alertStore.deleteMany(ids);
};
</script>

<template>
  <div class="w-full">
    <AlertListTable
      :alerts="alerts"
      :loading="isLoading"
      @mark-read="markAsRead"
      @delete="deleteAlert"
      @refresh="refresh"
      @mark-read-bulk="markAsReadBulk"
      @delete-bulk="deleteBulk"
    />
  </div>
</template>
