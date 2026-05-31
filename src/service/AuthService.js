import apiClient from "@/middlewares/authInterceptor";

const BASE_URL = "/user/api/auth";

export const AuthService = {
  async login(credentials) {
    const { data } = await apiClient.post(`${BASE_URL}/login`, credentials);
    return data;
  },

  async logout() {
    return apiClient.post(`${BASE_URL}/logout`);
  },

  async refreshToken() {
    const { data } = await apiClient.post(`${BASE_URL}/refresh`);
    return data;
  },

  async verifySession() {
    const { data } = await apiClient.get(`/user/api/internal/auth/verify`);
    return data;
  },

  async resetAdminPassword(resetCode, password) {
    const { data } = await apiClient.post(`/user/admin/reset-password`, {
      resetCode,
      password,
    });
    return data;
  },
};
