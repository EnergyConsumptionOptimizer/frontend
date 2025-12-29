import apiClient from "@/middlewares/authInterceptor";

const ENDPOINT = "/forecast/forecasts";

export const ForecastService = {
  async getForecasts() {
    const { data } = await apiClient.get(ENDPOINT);
    return data.forecasts || (Array.isArray(data) ? data : []);
  },
};
