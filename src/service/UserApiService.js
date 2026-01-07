import apiClient from "@/middlewares/authInterceptor";

const BASE_URL = "/user/household-users";

export const UserApiService = {
  async getAll() {
    const { data } = await apiClient.get(BASE_URL);
    return data["household-users"] ?? (Array.isArray(data) ? data : []);
  },

  async create(payload) {
    const { data } = await apiClient.post(BASE_URL, payload);
    return data;
  },

  async updateUsername(id, username) {
    const { data } = await apiClient.patch(`${BASE_URL}/${id}/username`, {
      username,
    });
    return data;
  },

  async delete(id) {
    return apiClient.delete(`${BASE_URL}/${id}`);
  },
};
