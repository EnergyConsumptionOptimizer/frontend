import axios from "axios";

const apiClient = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const AUTH_ROUTES = [
  "/user/auth/login",
  "/user/auth/refresh",
  "/user/auth/logout",
];

let refreshPromise = null;

const isAuthEndpoint = (url) =>
  AUTH_ROUTES.some((route) => url.includes(route));

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
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

      if (originalRequest.url.includes("/user/auth/verify")) {
        return Promise.resolve({
          data: { success: true, user: authStore.user },
          status: 200,
          statusText: "OK",
          headers: {},
          config: originalRequest,
        });
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
