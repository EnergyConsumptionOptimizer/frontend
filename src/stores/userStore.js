import { defineStore } from "pinia";
import { ref } from "vue";
import { UserService } from "@/service/UserService";
import { useAsyncAction } from "@/composables/utils/asyncAction";

export const useUserStore = defineStore("user", () => {
  const users = ref([]);

  const { isLoading, error, perform } = useAsyncAction();

  const fetchUsers = () =>
    perform(async () => {
      users.value = await UserService.getAll();
    });

  const createUser = (payload) =>
    perform(async () => {
      const newUser = await UserService.create(payload);
      users.value.push(newUser);
    });

  const updateUser = (id, username) =>
    perform(async () => {
      const updatedUser = await UserService.updateUsername(id, username);
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...updatedUser };
      }
    });

  const deleteUser = (id) =>
    perform(async () => {
      await UserService.delete(id);
      users.value = users.value.filter((u) => u.id !== id);
    });

  const deleteUsers = (ids) =>
    perform(async () => {
      await Promise.all(ids.map((id) => UserService.delete(id)));
      users.value = users.value.filter((u) => !ids.includes(u.id));
    });

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    deleteUsers,
  };
});
