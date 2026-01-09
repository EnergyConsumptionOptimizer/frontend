import apiClient from "@/middlewares/authInterceptor";

const BASE_URL = "/house-map";

export const MapService = {
  async getFloorPlan() {
    console.log("!!!");
    try {
      const { data } = await apiClient.get(`${BASE_URL}/floor-plan`);
      return data.svgContent || null;
    } catch {
      return null;
    }
  },
};
