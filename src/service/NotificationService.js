import apiClient from "@/middlewares/authInterceptor";
import { subscribeToSse } from "@/service/sseClient";

const BASE_URL = "/notification/api/notifications";

export const NotificationService = {
  async getNotifications() {
    const { data } = await apiClient.get(BASE_URL);
    return Array.isArray(data) ? data : [];
  },

  async getNotificationById(id) {
    const { data } = await apiClient.get(`${BASE_URL}/${id}`);
    return data;
  },

  async getUnreadCount() {
    const { data } = await apiClient.get(`${BASE_URL}/unread-count`);
    return data?.count ?? 0;
  },

  async markAsRead(id) {
    await apiClient.patch(`${BASE_URL}/${id}/read`);
  },

  async deleteNotification(id) {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async subscribeToUnreadNotifications({ onEvent, onOpen, signal } = {}) {
    return subscribeToSse(`${BASE_URL}/stream`, { onEvent, onOpen, signal });
  },
};
