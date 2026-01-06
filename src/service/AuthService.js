import apiClient from "@/middlewares/authInterceptor";

const ENDPOINT = "/user/auth";

export const AuthService = {
  async login(credentials) {
    const { data } = await apiClient.post(`${ENDPOINT}/login`, credentials);
    return data;
  },

  async logout() {
    return apiClient.post(`${ENDPOINT}/logout`);
  },

  async refreshToken() {
    const { data } = await apiClient.post(`${ENDPOINT}/refresh`);
    return data;
  },

  async verifySession() {
    const { data } = await apiClient.get(`${ENDPOINT}/verify`);
    return data;
  },

  async resetAdminPassword(resetCode, password) {
    const { data } = await apiClient.post(`/admin/reset-password`, {
      resetCode,
      password,
    });
    return data;
  },
};
