import apiClient from "@/middlewares/authInterceptor";

const THRESHOLD_BASE = "/threshold/thresholds";

export const ThresholdService = {
  async getThresholds() {
    const { data } = await apiClient.get(THRESHOLD_BASE);
    return data.thresholds || (Array.isArray(data) ? data : []);
  },

  async getThresholdById(id) {
    const { data } = await apiClient.get(`${THRESHOLD_BASE}/${id}`);
    return data;
  },

  async createThreshold(payload) {
    const { data } = await apiClient.post(THRESHOLD_BASE, payload);
    return data;
  },

  async updateThreshold(id, payload) {
    const { data } = await apiClient.put(`${THRESHOLD_BASE}/${id}`, payload);
    return data;
  },

  async deleteThreshold(id) {
    await apiClient.delete(`${THRESHOLD_BASE}/${id}`);
    return true;
  },

  async evaluateForecast(payload) {
    const { data } = await apiClient.post(
      `${THRESHOLD_BASE}/evaluations/forecast`,
      payload,
    );
    return data;
  },
};
