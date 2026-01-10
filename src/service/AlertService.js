import apiClient from "@/middlewares/authInterceptor";
import { subscribeToSse } from "@/service/sseClient";

const BASE_URL = "/alert/alerts";

export const AlertService = {
  async getAlerts() {
    const { data } = await apiClient.get(`${BASE_URL}/`);
    return data?.data ?? [];
  },

  async getAlertById(id) {
    const { data } = await apiClient.get(`${BASE_URL}/${id}`);
    return data?.data;
  },

  async getUnreadCount() {
    const { data } = await apiClient.get(`${BASE_URL}/unread-count`);
    return data?.data?.count ?? data?.data ?? 0;
  },

  async markAsRead(id) {
    const { data } = await apiClient.patch(`${BASE_URL}/${id}`, { read: true });
    return data?.data;
  },

  async deleteAlert(id) {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async subscribeToUnreadAlerts({ onEvent, onOpen, signal } = {}) {
    return subscribeToSse(`${BASE_URL}/stream`, { onEvent, onOpen, signal });
  },
};
