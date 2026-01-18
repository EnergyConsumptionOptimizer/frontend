import apiClient from "@/middlewares/authInterceptor";
import axios from "axios";

const BASE_URL = "/hookup/api";

export const SmartFurnitureHookupService = {
  async fetchSmartFurnitureHookups() {
    return apiClient.get(`${BASE_URL}/smart-furniture-hookups/`);
  },
  async findSmartFurnitureHookup(id) {
    return apiClient.get(`${BASE_URL}/smart-furniture-hookups/${id}`);
  },
  async addSmartFurnitureHookup(smartFurnitureHookup) {
    return apiClient.post(`${BASE_URL}/smart-furniture-hookups/`, {
      name: smartFurnitureHookup.name,
      utilityType: smartFurnitureHookup.utilityType,
      endpoint: smartFurnitureHookup.endpoint,
    });
  },
  async updateSmartFurnitureHookup(id, payload) {
    return apiClient.patch(
      `${BASE_URL}/smart-furniture-hookups/${id}`,
      payload,
    );
  },
  async deleteSmartFurnitureHookup(id) {
    return apiClient.delete(`${BASE_URL}/smart-furniture-hookups/${id}`);
  },

  async fetchExternalEndpointInfo(endpoint) {
    return axios.get(endpoint);
  },
};
