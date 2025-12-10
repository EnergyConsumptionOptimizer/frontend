import axios from "axios";

const API_URL = "/api";
const ENDPOINTS = {
  LOGIN: "/auth/login",
  REFRESH: "/auth/refresh",
  VERIFY: "/auth/verify",
  LOGOUT: "/auth/logout",
};

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise = null;

const isAuthManagementEndpoint = (url) => {
  return url.includes(ENDPOINTS.LOGIN) || url.includes(ENDPOINTS.REFRESH);
};

const createSessionRestoredResponse = (config, user) => {
  return {
    data: {
      success: true,
      user: user,
    },
    status: 200,
    statusText: "OK",
    headers: {},
    config: config,
  };
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (isAuthManagementEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();

    try {
      if (!refreshPromise) {
        refreshPromise = authStore.refreshToken();
      }

      const success = await refreshPromise;

      if (!success) {
        await authStore.logout();
        return Promise.reject(error);
      }

      if (originalRequest.url.includes(ENDPOINTS.VERIFY)) {
        return Promise.resolve(
          createSessionRestoredResponse(originalRequest, authStore.user),
        );
      }

      return apiClient(originalRequest);
    } catch (err) {
      return Promise.reject(err);
    } finally {
      refreshPromise = null;
    }
  },
);

export default apiClient;
