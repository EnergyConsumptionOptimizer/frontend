import apiClient from "@/middlewares/authInterceptor";

const BASE_URL = "/smart-furniture-hookup";

export const SmartFurnitureHookupService = {
  async saveSmartFurnitureHookup(smartFurnitureHookup) {
    const { data } = await apiClient.post(
      `${BASE_URL}/smart-furniture-hookups/`,
      {
        name: smartFurnitureHookup.name,
        utilityType: smartFurnitureHookup.utilityType,
        endpoint: smartFurnitureHookup.endpoint,
      },
    );

    return data;
  },
  async deleteSmartFurnitureHookup(id) {
    return apiClient.delete(`${BASE_URL}/smart-furniture-hookups/${id}`);
  },
};
