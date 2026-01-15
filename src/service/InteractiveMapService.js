import apiClient from "@/middlewares/authInterceptor";
import { SmartFurnitureHookupService } from "@/service/SmartFurnitureService.js";

const BASE_URL = "/house-map";

export const InteractiveMapService = {
  async fetchFloorPlan() {
    try {
      const { data } = await apiClient.get(`${BASE_URL}/floor-plan`);
      return data.svgContent || null;
    } catch {
      return null;
    }
  },
  async fetchZones() {
    console.log("fetch");
    const { data } = await apiClient.get(`${BASE_URL}/zones`);
    return data.map((z) => {
      return {
        ...z,
        points: z.vertices,
      };
    });
  },
  smartFurnitureHookupDTO(info, mapInfo) {
    console.log(info, mapInfo);
    return {
      ...info,
      utilityType: info.utilityType.toUpperCase(),
      position: mapInfo?.position || null,
      zone: mapInfo?.zoneID || null,
    };
  },
  async fetchSmartFurnitureHookups() {
    const req1 = await SmartFurnitureHookupService.fetchSmartFurnitureHookups();

    const infoData = req1.data.smartFurnitureHookups;

    const req2 = await apiClient.get(`${BASE_URL}/smart-furniture-hookups`);
    const mapData = req2.data;

    return infoData.map((info) => {
      const mapItem = mapData.find((map) => map.id === info.id);
      return this.smartFurnitureHookupDTO(info, mapItem);
    });
  },

  async saveFloorPlan(svgData) {
    const { data } = await apiClient.post(`${BASE_URL}/floor-plan`, {
      svgContent: svgData,
    });

    return data;
  },

  zoneDTO(data) {
    return {
      id: data.id,
      name: data.name,
      color: data.color,
      points: data.vertices,
    };
  },
  async findZone(id) {
    const { data } = await apiClient.get(`${BASE_URL}/zones/${id}`);
    return this.zoneDTO(data);
  },
  async addZone(zone) {
    const { data } = await apiClient.post(`${BASE_URL}/zones`, {
      name: zone.name,
      color: zone.color,
      vertices: zone.points,
    });

    return this.zoneDTO(data);
  },
  async updateZone(id, payload) {
    const updatePayload = {
      ...payload,
    };

    if (updatePayload.points) {
      updatePayload.vertices = payload.points;
      delete updatePayload.points;
    }

    const { data } = await apiClient.patch(
      `${BASE_URL}/zones/${id}`,
      updatePayload,
    );

    return this.zoneDTO(data);
  },
  async deleteZone(id) {
    return apiClient.delete(`${BASE_URL}/zones/${id}`);
  },
  async findSmartFurnitureHookup(id) {
    const reqInfo =
      await SmartFurnitureHookupService.findSmartFurnitureHookup(id);
    const reqMap = await apiClient.get(
      `${BASE_URL}/smart-furniture-hookups/${id}`,
    );

    return this.smartFurnitureHookupDTO(reqInfo.data, reqMap.data);
  },
  async addSmartFurnitureHookup(smartFurnitureHookup) {
    const reqInfo =
      await SmartFurnitureHookupService.addSmartFurnitureHookup(
        smartFurnitureHookup,
      );

    const reqMap = await apiClient
      .post(`${BASE_URL}/smart-furniture-hookups`, {
        id: reqInfo.data.id,
        position: smartFurnitureHookup.position,
        zoneID: smartFurnitureHookup.zone,
      })
      .catch(async (error) => {
        await SmartFurnitureHookupService.deleteSmartFurnitureHookup(
          reqInfo.data.id,
        );
        throw error;
      });

    return this.smartFurnitureHookupDTO(reqInfo.data, reqMap.data);
  },
  async updateSmartFurnitureHookup(id, payload) {
    let reqInfo;
    let reqMap;

    if (payload.name || payload.endpoint) {
      reqInfo = await SmartFurnitureHookupService.updateSmartFurnitureHookup(
        id,
        payload,
      );
    } else {
      reqInfo = await SmartFurnitureHookupService.findSmartFurnitureHookup(id);
    }
    if (payload.position || payload.zone) {
      const updatePayload = {
        ...payload,
      };

      if (updatePayload.zone) {
        updatePayload.zoneID = payload.zone;
        delete updatePayload.zone;
      }

      reqMap = await apiClient.patch(
        `${BASE_URL}/smart-furniture-hookups/${id}`,
        updatePayload,
      );
    } else {
      reqMap = await apiClient.get(`${BASE_URL}/smart-furniture-hookups/${id}`);
    }

    return this.smartFurnitureHookupDTO(reqInfo.data, reqMap.data);
  },
  async updateSmartFurnitureHookupsPosition(smartFurnitureHookupsToUpdate) {
    await Promise.allSettled(
      smartFurnitureHookupsToUpdate.map(
        async (sfh) =>
          await apiClient.patch(
            `${BASE_URL}/smart-furniture-hookups/${sfh.id}`,
            {
              position: sfh.position,
            },
          ),
      ),
    );
  },
  async deleteSmartFurnitureHookup(id) {
    await SmartFurnitureHookupService.deleteSmartFurnitureHookup(id);
    return apiClient.delete(`${BASE_URL}/smart-furniture-hookups/${id}`);
  },
};
