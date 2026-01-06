import apiClient from "@/middlewares/authInterceptor";

const ENDPOINT = "/user/household-users";

export const UserService = {
  async getAll() {
    const { data } = await apiClient.get(ENDPOINT);
    return data["household-users"] ?? (Array.isArray(data) ? data : []);
  },

  async create(payload) {
    const { data } = await apiClient.post(ENDPOINT, payload);
    return data;
  },

  async updateUsername(id, username) {
    const { data } = await apiClient.patch(`${ENDPOINT}/${id}/username`, {
      username,
    });
    return data;
  },

  async delete(id) {
    return apiClient.delete(`${ENDPOINT}/${id}`);
  },
};
