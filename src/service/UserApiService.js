import apiClient from "@/middlewares/authInterceptor";

const BASE_URL = "/user/api/users";

export const UserApiService = {
  async getAll() {
    const { data } = await apiClient.get(BASE_URL);
    return Array.isArray(data) ? data : [];
  },

  async create(payload) {
    const { data } = await apiClient.post(BASE_URL, payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await apiClient.patch(
      `${BASE_URL}/${id}/username`,
      payload,
    );
    return data;
  },

  async delete(id) {
    return apiClient.delete(`${BASE_URL}/${id}`);
  },

  async updatePassword(id, password) {
    const { data } = await apiClient.patch(`${BASE_URL}/${id}/password`, {
      password,
    });
    return data;
  },
};
