<script setup>
import { ref, onMounted } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useUserStore } from "@/stores/userStore";
import UserListTable from "@/components/users/UserListTable.vue";
import UserFormDialog from "@/components/users/UserFormDialog.vue";
import { confirmDeleteDialog } from "@/utils/ui/confirmPresets.js";

const confirm = useConfirm();
const userStore = useUserStore();

const userDialog = ref(false);
const user = ref({});
const selectedUsers = ref([]);

onMounted(() => {
  userStore.fetchUsers();
});

const openNew = () => {
  user.value = {};
  userDialog.value = true;
};

const hideDialog = () => {
  userDialog.value = false;
};

const editUser = (userData) => {
  user.value = { ...userData };
  userDialog.value = true;
};

const saveUser = async (payload) => {
  let success;
  if (payload.id) {
    success = await userStore.updateUser(payload.id, payload.username);
    if (success && payload.password) {
      await userStore.updateUserPassword(payload.id, payload.password);
    }
  } else {
    success = await userStore.createUser(payload);
  }

  if (success) hideDialog();
};

const confirmDeleteUser = (userData) => {
  confirm.require(
    confirmDeleteDialog({
      message: `Are you sure you want to delete ${userData.username}?`,
      header: "Delete User",
      onAccept: async () => {
        const success = await userStore.deleteUser(userData.id);
        if (success) {
          selectedUsers.value = selectedUsers.value.filter(
            (u) => u.id !== userData.id,
          );
        }
      },
    }),
  );
};

const confirmDeleteSelected = () => {
  confirm.require(
    confirmDeleteDialog({
      message: "Are you sure you want to delete selected users?",
      header: "Delete Users",
      onAccept: async () => {
        const ids = selectedUsers.value.map((u) => u.id);
        const success = await userStore.deleteUsers(ids);
        if (success) selectedUsers.value = [];
      },
    }),
  );
};
</script>

<template>
  <div class="card">
    <div v-if="$slots.header" class="mb-4 sm:mb-6">
      <slot name="header"></slot>
    </div>

    <UserListTable
      :users="userStore.users"
      :loading="userStore.isLoading"
      v-model:selectedUsers="selectedUsers"
      @create="openNew"
      @edit="editUser"
      @delete="confirmDeleteUser"
      @delete-selected="confirmDeleteSelected"
    />

    <UserFormDialog
      v-model:visible="userDialog"
      v-model:user="user"
      :loading="userStore.isLoading"
      @save="saveUser"
      @cancel="hideDialog"
    />
  </div>
</template>
