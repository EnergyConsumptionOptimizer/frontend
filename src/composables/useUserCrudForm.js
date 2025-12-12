import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { MockedUserService } from "@/service/mock/MockedUserService";

export function useUserCrudForm() {
  const toast = useToast();
  const confirm = useConfirm();

  const users = ref([]);
  const user = ref({});
  const selectedUsers = ref([]);
  const loading = ref(false);
  const userDialog = ref(false);
  const submitted = ref(false);

  const executeAsync = async (action, successMessage) => {
    loading.value = true;
    try {
      await action();
      if (successMessage) {
        toast.add({
          severity: "success",
          summary: "Success",
          detail: successMessage,
          life: 3000,
        });
      }
      return true;
    } catch (error) {
      console.error(error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Operation Failed",
        life: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  };

  const loadUsers = () =>
    executeAsync(async () => {
      const rawData = await MockedUserService.getUsers();
      users.value = rawData.map((u) => ({ ...u, id: u.id || u._id }));
    });

  const createUser = async () => {
    if (!user.value.username?.trim()) return;
    if (!user.value.password?.trim()) return;

    await executeAsync(async () => {
      const result = await MockedUserService.createUser(user.value);
      const normalized = { ...result, id: result.id || result._id };

      users.value.push(normalized);
      hideDialog();
    }, "User Created");
  };

  const updateUser = async () => {
    if (!user.value.username?.trim()) return;

    await executeAsync(async () => {
      const result = await MockedUserService.updateUsername(
        user.value.id,
        user.value.username,
      );
      const normalized = { ...result, id: result.id || result._id };

      const index = users.value.findIndex((u) => u.id === user.value.id);
      if (index !== -1) users.value[index] = normalized;

      hideDialog();
    }, "User Updated");
  };

  const saveUser = () => {
    submitted.value = true;
    if (user.value.id) {
      updateUser();
    } else {
      createUser();
    }
  };

  const confirmDeleteUser = (targetUser) => {
    confirm.require({
      message: `Delete ${targetUser.username}?`,
      header: "Confirm",
      icon: "pi pi-exclamation-triangle",
      acceptClass: "p-button-danger",
      accept: () =>
        executeAsync(async () => {
          await MockedUserService.deleteUser(targetUser.id);
          users.value = users.value.filter((u) => u.id !== targetUser.id);
        }, "User Deleted"),
    });
  };

  const confirmDeleteSelected = () => {
    confirm.require({
      message: "Delete selected users?",
      header: "Confirm",
      icon: "pi pi-exclamation-triangle",
      acceptClass: "p-button-danger",
      accept: () =>
        executeAsync(async () => {
          const idsToDelete = selectedUsers.value.map((u) => u.id);
          users.value = users.value.filter((u) => !idsToDelete.includes(u.id));
          selectedUsers.value = [];
        }, "Users Deleted"),
    });
  };

  const openNew = () => {
    user.value = {};
    submitted.value = false;
    userDialog.value = true;
  };
  const openEdit = (u) => {
    user.value = { ...u };
    userDialog.value = true;
  };
  const hideDialog = () => {
    userDialog.value = false;
    submitted.value = false;
  };

  return {
    users,
    user,
    selectedUsers,
    loading,
    userDialog,
    submitted,
    loadUsers,
    saveUser,
    confirmDeleteUser,
    confirmDeleteSelected,
    openNew,
    openEdit,
    hideDialog,
  };
}
