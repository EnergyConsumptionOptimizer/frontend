import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { UserApiService } from "@/service/UserApiService";
import { UserLocalService } from "@/service/local/UserLocalService";
import { useAsyncAction } from "@/composables/utils/asyncAction";

export const useUserStore = defineStore("user", () => {
  const users = ref([]);
  const isLocalMode = ref(false);
  const { isLoading, error, perform } = useAsyncAction();

  const activeService = computed(() =>
    isLocalMode.value ? UserLocalService : UserApiService,
  );

  const fetchUsers = () =>
    perform(async () => {
      users.value = await activeService.value.getAll();
    });

  const createUser = (payload) =>
    perform(async () => {
      const newUser = await activeService.value.create(payload);
      users.value.push(newUser);
    });

  const updateUser = (id, username) =>
    perform(async () => {
      const updatedUser = await activeService.value.update(id, { username });
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...updatedUser };
      }
    });

  const deleteUser = (id) =>
    perform(async () => {
      await activeService.value.delete(id);
      users.value = users.value.filter((u) => u.id !== id);
    });

  const deleteUsers = (ids) =>
    perform(async () => {
      await Promise.all(ids.map((id) => activeService.value.delete(id)));
      users.value = users.value.filter((u) => !ids.includes(u.id));
    });

  const setLocalMode = (active) => {
    isLocalMode.value = active;
    users.value = [];
    fetchUsers();
  };

  const syncAndFinalize = () =>
    perform(async () => {
      if (!isLocalMode.value) return;

      const localUsers = await UserLocalService.getAll();

      const promises = localUsers.map(({ ...payload }) =>
        UserApiService.create(payload),
      );

      const createdUsers = await Promise.all(promises);

      UserLocalService.clear();
      isLocalMode.value = false;
      users.value = createdUsers;

      return true;
    });

  return {
    users,
    isLoading,
    error,
    isLocalMode,
    setLocalMode,
    syncAndFinalize,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    deleteUsers,
  };
});
