import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useAuthStore } from "./authsStore.js";
import { NotificationService } from "@/service/NotificationService";
import { useAsyncAction } from "@/composables/utils/asyncAction";

const MAX_RETRIES = 10;

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref([]);
  const unreadCount = ref(0);
  const isConnected = ref(false);
  const isConnectionFailed = ref(false);

  const { isLoading, error, perform } = useAsyncAction();
  const authStore = useAuthStore();

  let abortController = null;
  let reconnectTimer = null;
  let reconnectAttempt = 0;

  const unreadNotifications = computed(() =>
    notifications.value.filter((n) => !n.isRead),
  );
  const hasUnread = computed(() => unreadCount.value > 0);
  const getById = computed(
    () => (id) => notifications.value.find((n) => n.id === id),
  );

  const fetchNotifications = () =>
    perform(async () => {
      notifications.value = await NotificationService.getNotifications();
    });

  const fetchUnreadCount = async () => {
    try {
      unreadCount.value = await NotificationService.getUnreadCount();
    } catch (err) {
      console.error("Silent error fetching unread count:", err);
    }
  };

  const sync = () => {
    if (isLoading.value) return Promise.resolve(false);

    return perform(async () => {
      const [notificationsData, countData] = await Promise.all([
        NotificationService.getNotifications(),
        NotificationService.getUnreadCount(),
      ]);
      notifications.value = notificationsData;
      unreadCount.value = countData;
    });
  };

  const markAsRead = (id) =>
    perform(async () => {
      const notification = notifications.value.find((n) => n.id === id);

      if (!notification || notification.isRead) return;

      notification.isRead = true;
      if (unreadCount.value > 0) unreadCount.value--;

      try {
        await NotificationService.markAsRead(id);
      } catch (err) {
        notification.isRead = false;
        unreadCount.value++;
        throw err;
      }
    });

  const deleteNotification = (id) =>
    perform(async () => {
      const index = notifications.value.findIndex((n) => n.id === id);
      if (index === -1) return;

      const notification = notifications.value[index];
      const wasRead = notification.isRead;

      notifications.value.splice(index, 1);
      if (!wasRead && unreadCount.value > 0) unreadCount.value--;

      try {
        await NotificationService.deleteNotification(id);
      } catch (err) {
        notifications.value.splice(index, 0, notification);
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
      await Promise.all(ids.map((id) => deleteNotification(id)));
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
        await NotificationService.subscribeToUnreadNotifications({
          signal: abortController.signal,
          onOpen: () => {
            reconnectAttempt = 0;
            isConnectionFailed.value = false;
            sync();
          },
          onEvent: (data) => {
            if (data?.type === "NEW_NOTIFICATION") {
              fetchNotifications();
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
        notifications.value = [];
        unreadCount.value = 0;
      }
    },
    { immediate: true },
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    isConnected,
    isConnectionFailed,
    unreadNotifications,
    hasUnread,
    getById,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markManyAsRead,
    deleteNotification,
    deleteMany,
    sync,
    connect,
    disconnect,
    retryConnection,
  };
});
