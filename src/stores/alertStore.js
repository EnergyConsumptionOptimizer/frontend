import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useAuthStore } from "./auth";
import { AlertService } from "@/service/AlertService";

export const useAlertStore = defineStore("alert", () => {
  const alerts = ref([]);
  const unreadCount = ref(0);
  const isLoading = ref(false);
  const error = ref(null);

  const authStore = useAuthStore();
  let abortController = null;
  let reconnectTimer = null;
  let reconnectAttempt = 0;
  let isRunning = false;

  const unreadAlerts = computed(() => alerts.value.filter((a) => !a.isRead));
  const hasUnread = computed(() => unreadCount.value > 0);
  const getById = (id) => alerts.value.find((a) => a.id === id);

  async function fetchAlerts() {
    isLoading.value = true;
    error.value = null;
    try {
      alerts.value = await AlertService.getAlerts();
    } catch (err) {
      error.value = err.message || "Failed to fetch alerts";
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUnreadCount() {
    try {
      unreadCount.value = await AlertService.getUnreadCount();
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  }

  async function markAsRead(id) {
    const alert = alerts.value.find((a) => a.id === id);
    if (alert && alert.isRead) return;
    if (alert) alert.isRead = true;
    if (unreadCount.value > 0) unreadCount.value--;

    try {
      await AlertService.markAsRead(id);
    } catch (err) {
      if (alert) alert.isRead = false;
      unreadCount.value++;
      error.value = err.message || "Failed to mark as read";
    }
  }

  async function deleteAlert(id) {
    const index = alerts.value.findIndex((a) => a.id === id);
    if (index === -1) return;

    const alert = alerts.value[index];
    const wasRead = alert.isRead;
    alerts.value.splice(index, 1);
    if (!wasRead && unreadCount.value > 0) unreadCount.value--;

    try {
      await AlertService.deleteAlert(id);
    } catch (err) {
      alerts.value.splice(index, 0, alert);
      if (!wasRead) unreadCount.value++;
      error.value = err.message || "Failed to delete alert";
    }
  }

  async function markManyAsRead(ids) {
    if (!ids || ids.length === 0) return;
    const promises = ids.map((id) => markAsRead(id));
    await Promise.all(promises);
  }

  async function deleteMany(ids) {
    if (!ids || ids.length === 0) return;
    const promises = ids.map((id) => deleteAlert(id));
    await Promise.all(promises);
  }

  async function sync() {
    isLoading.value = true;
    error.value = null;
    try {
      await Promise.all([fetchAlerts(), fetchUnreadCount()]);
    } catch (err) {
      error.value = err.message || "Sync failed";
    } finally {
      isLoading.value = false;
    }
  }

  // SSE Logic
  const scheduleReconnect = () => {
    if (!authStore.user || !authStore.isAdmin || reconnectTimer) return;

    reconnectAttempt += 1;
    const delayMs = Math.min(10000, 500 * 2 ** Math.min(reconnectAttempt, 4));
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delayMs);
  };

  function connect() {
    if (isRunning || !authStore.user || !authStore.isAdmin) return;

    isRunning = true;
    abortController = new AbortController();

    const run = async () => {
      try {
        await AlertService.subscribeToUnreadAlerts({
          signal: abortController.signal,
          onOpen: () => {
            reconnectAttempt = 0;
            sync();
          },
          onEvent: (data) => {
            if (
              data?.type === "NEW_ALERT" ||
              data?.type === "NEW_NOTIFICATION"
            ) {
              fetchUnreadCount();
              fetchAlerts();
            }
          },
        });
      } catch {
        if (!abortController?.signal?.aborted) scheduleReconnect();
      } finally {
        isRunning = false;
        abortController = null;
        scheduleReconnect();
      }
    };

    run();
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (abortController) abortController.abort();
    abortController = null;
    isRunning = false;
  }

  watch(
    () => authStore.user,
    (user) => {
      if (user && authStore.isAdmin) {
        connect();
      } else {
        disconnect();
        alerts.value = [];
        unreadCount.value = 0;
      }
    },
    { immediate: true },
  );

  return {
    alerts,
    unreadCount,
    isLoading,
    error,
    unreadAlerts,
    hasUnread,
    getById,
    fetchAlerts,
    fetchUnreadCount,
    markAsRead,
    deleteAlert,
    markManyAsRead,
    deleteMany,
    sync,
    connect,
    disconnect,
  };
});
