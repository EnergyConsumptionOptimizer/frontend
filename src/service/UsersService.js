import apiClient from "@/middlewares/authInterceptor";

export const UserService = {
  async getUsers() {
    const { data } = await apiClient.get("/household-users");
    return data["household-users"] ?? [];
  },

  async createUser(payload) {
    const { data } = await apiClient.post("/household-users", payload);
    return data;
  },

  async updateUsername(id, username) {
    const { data } = await apiClient.patch(`/household-users/${id}/username`, {
      username,
    });
    return data;
  },

  async deleteUser(id) {
    await apiClient.delete(`/household-users/${id}`);
  },
};
