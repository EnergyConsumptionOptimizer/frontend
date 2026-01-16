import apiClient from "@/middlewares/authInterceptor";

const BASE_URL = "/forecast/api/forecasts";

export const ForecastService = {
  async getForecasts() {
    const { data } = await apiClient.get(BASE_URL);
    return data.forecasts || (Array.isArray(data) ? data : []);
  },
};
