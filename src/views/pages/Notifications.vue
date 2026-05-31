<script setup>
import { useNotificationStore } from "@/stores/notificationStore";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import NotificationListTable from "@/components/notifications/NotificationListTable.vue";

const notificationStore = useNotificationStore();
const { notifications, isLoading } = storeToRefs(notificationStore);

onMounted(() => {
  notificationStore.sync();
});

const markAsRead = (notification) => {
  notificationStore.markAsRead(notification.id);
};

const deleteNotification = (notification) => {
  notificationStore.deleteNotification(notification.id);
};

const refresh = () => {
  notificationStore.sync();
};

const markAsReadBulk = (notifications) => {
  const ids = notifications.map((n) => n.id);
  notificationStore.markManyAsRead(ids);
};

const deleteBulk = (notifications) => {
  const ids = notifications.map((n) => n.id);
  notificationStore.deleteMany(ids);
};
</script>

<template>
  <div class="card">
    <NotificationListTable
      :notifications="notifications"
      :loading="isLoading"
      @mark-read="markAsRead"
      @delete="deleteNotification"
      @refresh="refresh"
      @mark-read-bulk="markAsReadBulk"
      @delete-bulk="deleteBulk"
    />
  </div>
</template>
