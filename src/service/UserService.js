import apiClient from "@/middlewares/authInterceptor";

const AUTH_BASE = "/user/auth";
const HOUSEHOLD_BASE = "/user/household-users";

export const UserService = {
  async login(credentials) {
    const { data } = await apiClient.post(`${AUTH_BASE}/login`, credentials);
    return data;
  },

  async logout() {
    await apiClient.post(`${AUTH_BASE}/logout`);
  },

  async refreshToken() {
    const { data } = await apiClient.post(`${AUTH_BASE}/refresh`);
    return data;
  },

  async verifySession() {
    const { data } = await apiClient.get(`${AUTH_BASE}/verify`);
    return data;
  },

  async getUsers() {
    const { data } = await apiClient.get(HOUSEHOLD_BASE);
    return data["household-users"] || (Array.isArray(data) ? data : []);
  },

  async createUser(payload) {
    const { data } = await apiClient.post(HOUSEHOLD_BASE, payload);
    return data;
  },

  async updateUsername(id, username) {
    const { data } = await apiClient.patch(`${HOUSEHOLD_BASE}/${id}/username`, {
      username,
    });
    return data;
  },

  async deleteUser(id) {
    await apiClient.delete(`${HOUSEHOLD_BASE}/${id}`);
    return true;
  },

  async resetAdminPassword(resetCode, password) {
    const { data } = await apiClient.post(`/admin/reset-password`, {
      resetCode,
      password,
    });
    return data;
  },
};
