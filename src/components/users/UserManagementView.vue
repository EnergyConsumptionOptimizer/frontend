<script setup>
import { ref, onMounted } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useUserStore } from "@/stores/userStore";
import UserListTable from "@/components/users/UserListTable.vue";
import UserFormDialog from "@/components/users/UserFormDialog.vue";
import { confirmDeleteDialog } from "@/utils/ui/confirmPresets.js";

const props = defineProps({
  isLocalMode: {
    type: Boolean,
    default: false,
  },
});

const confirm = useConfirm();
const userStore = useUserStore();

const userDialog = ref(false);
const user = ref({});
const selectedUsers = ref([]);
const submitted = ref(false);

onMounted(() => {
  userStore.setLocalMode(props.isLocalMode);
  userStore.fetchUsers();
});

const openNew = () => {
  user.value = {};
  submitted.value = false;
  userDialog.value = true;
};

const hideDialog = () => {
  userDialog.value = false;
  submitted.value = false;
};

const editUser = (prod) => {
  user.value = { ...prod };
  userDialog.value = true;
};

const saveUser = async () => {
  submitted.value = true;
  if (user.value.username?.trim()) {
    let success = false;
    if (user.value.id) {
      success = await userStore.updateUser(user.value.id, user.value.username);
    } else {
      if (!user.value.password?.trim()) return;
      success = await userStore.createUser(user.value);
    }
    if (success) hideDialog();
  }
};

const confirmDeleteUser = (prod) => {
  confirm.require(
    confirmDeleteDialog({
      message: `Are you sure you want to delete ${prod.username}?`,
      header: "Delete User",
      onAccept: async () => {
        await userStore.deleteUser(prod.id);
        selectedUsers.value = selectedUsers.value.filter(
          (u) => u.id !== prod.id,
        );
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
    <div v-if="$slots.header" class="mb-4">
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
      :submitted="submitted"
      :loading="userStore.isLoading"
      @save="saveUser"
      @cancel="hideDialog"
    />
  </div>
</template>
