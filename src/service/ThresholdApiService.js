import apiClient from "@/middlewares/authInterceptor";

const BASE_URL = "/threshold/thresholds";

export const ThresholdApiService = {
  async getThresholds() {
    const { data } = await apiClient.get(BASE_URL);
    return data.thresholds || (Array.isArray(data) ? data : []);
  },

  async getThresholdById(id) {
    const { data } = await apiClient.get(`${BASE_URL}/${id}`);
    return data;
  },

  async createThreshold(payload) {
    const { data } = await apiClient.post(BASE_URL, payload);
    return data;
  },

  async updateThreshold(id, payload) {
    const { data } = await apiClient.put(`${BASE_URL}/${id}`, payload);
    return data;
  },

  async deleteThreshold(id) {
    await apiClient.delete(`${BASE_URL}/${id}`);
    return true;
  },
};
