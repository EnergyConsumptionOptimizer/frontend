import apiClient from "@/middlewares/authInterceptor";
import { SmartFurnitureHookupService } from "@/service/SmartFurnitureService.js";

const BASE_URL = "/house-map";

export const MapService = {
  async getFloorPlan() {
    try {
      const { data } = await apiClient.get(`${BASE_URL}/floor-plan`);
      return data.svgContent || null;
    } catch {
      return null;
    }
  },
  async saveFloorPlan(svgData) {
    const { data } = await apiClient.post(`${BASE_URL}/floor-plan`, {
      svgContent: svgData,
    });

    return data;
  },

  async saveZone(zone) {
    const { data } = await apiClient.post(`${BASE_URL}/zones`, {
      name: zone.name,
      color: zone.color,
      vertices: zone.points,
    });
    return data;
  },

  async saveSmartFurnitureHookup(smartFurnitureHookup) {
    const result =
      await SmartFurnitureHookupService.saveSmartFurnitureHookup(
        smartFurnitureHookup,
      );

    const { data } = await apiClient.post(
      `${BASE_URL}/smart-furniture-hookups`,
      {
        id: result.id,
        position: smartFurnitureHookup.position,
        zoneID: smartFurnitureHookup.zone,
      },
    );
    return data;
  },
};
