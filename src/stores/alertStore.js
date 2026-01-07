import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useAuthStore } from "./auth";
import { AlertService } from "@/service/AlertService";
import { useAsyncAction } from "@/composables/utils/asyncAction";

const MAX_RETRIES = 10;

export const useAlertStore = defineStore("alert", () => {
  const alerts = ref([]);
  const unreadCount = ref(0);
  const isConnected = ref(false);
  const isConnectionFailed = ref(false);

  const { isLoading, error, perform } = useAsyncAction();
  const authStore = useAuthStore();

  let abortController = null;
  let reconnectTimer = null;
  let reconnectAttempt = 0;

  const unreadAlerts = computed(() => alerts.value.filter((a) => !a.isRead));
  const hasUnread = computed(() => unreadCount.value > 0);
  const getById = computed(() => (id) => alerts.value.find((a) => a.id === id));

  const fetchAlerts = () =>
    perform(async () => {
      alerts.value = await AlertService.getAlerts();
    });

  const fetchUnreadCount = async () => {
    try {
      unreadCount.value = await AlertService.getUnreadCount();
    } catch (err) {
      console.error("Silent error fetching unread count:", err);
    }
  };

  const sync = () =>
    perform(async () => {
      await Promise.all([
        AlertService.getAlerts(),
        AlertService.getUnreadCount(),
      ]).then(([alertsData, countData]) => {
        alerts.value = alertsData;
        unreadCount.value = countData;
      });
    });

  const markAsRead = (id) =>
    perform(async () => {
      const alert = alerts.value.find((a) => a.id === id);

      if (!alert || alert.isRead) return;

      alert.isRead = true;
      if (unreadCount.value > 0) unreadCount.value--;

      try {
        await AlertService.markAsRead(id);
      } catch (err) {
        alert.isRead = false;
        unreadCount.value++;
        throw err;
      }
    });

  const deleteAlert = (id) =>
    perform(async () => {
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
        throw err;
      }
    });

  const markManyAsRead = (ids) =>
    perform(async () => {
      if (!ids?.length) return;
      await Promise.all(ids.map((id) => markAsRead(id)));
    });

  const deleteMany = (ids) =>
    perform(async () => {
      if (!ids?.length) return;
      await Promise.all(ids.map((id) => deleteAlert(id)));
    });

  const disconnect = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (abortController) abortController.abort();

    reconnectTimer = null;
    abortController = null;
    isConnected.value = false;
    isConnectionFailed.value = false;
  };

  const scheduleReconnect = () => {
    if (!authStore.user || !authStore.isAdmin || reconnectTimer) return;

    if (reconnectAttempt >= MAX_RETRIES) {
      console.warn(`SSE: Max retries (${MAX_RETRIES}) reached. Stopping.`);
      isConnectionFailed.value = true;
      isConnected.value = false;
      return;
    }

    reconnectAttempt++;
    const delayMs = Math.min(10000, 500 * 2 ** Math.min(reconnectAttempt, 4));

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delayMs);
  };

  const connect = () => {
    if (isConnected.value || !authStore.user || !authStore.isAdmin) return;

    isConnected.value = true;
    isConnectionFailed.value = false;
    abortController = new AbortController();

    const startSubscription = async () => {
      try {
        await AlertService.subscribeToUnreadAlerts({
          signal: abortController.signal,
          onOpen: () => {
            reconnectAttempt = 0;
            isConnectionFailed.value = false;
            sync();
          },
          onEvent: (data) => {
            if (data?.type === "NEW_ALERT") {
              fetchUnreadCount();
            }
          },
        });
      } catch (err) {
        if (!abortController?.signal?.aborted) {
          isConnected.value = false;
          scheduleReconnect();
        }
      } finally {
        if (isConnected.value) {
          isConnected.value = false;
          scheduleReconnect();
        }
      }
    };

    startSubscription();
  };

  const retryConnection = () => {
    disconnect();
    reconnectAttempt = 0;
    connect();
  };

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
    isConnected,
    isConnectionFailed,
    unreadAlerts,
    hasUnread,
    getById,
    fetchAlerts,
    fetchUnreadCount,
    markAsRead,
    markManyAsRead,
    deleteAlert,
    deleteMany,
    sync,
    connect,
    disconnect,
    retryConnection,
  };
});
