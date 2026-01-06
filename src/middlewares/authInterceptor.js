import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const AUTH_ROUTES = [
  "/user/auth/login",
  "/user/auth/refresh",
  "/user/auth/logout",
];

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      AUTH_ROUTES.some((route) => originalRequest.url.includes(route))
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { useAuthStore } = await import("@/stores/auth");
      const authStore = useAuthStore();

      if (!refreshPromise) {
        refreshPromise = authStore.refreshToken();
      }

      const success = await refreshPromise;

      if (!success) {
        await authStore.logout();
        return Promise.reject(error);
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
