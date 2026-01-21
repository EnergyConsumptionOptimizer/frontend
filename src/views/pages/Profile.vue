<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authsStore";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";
import Card from "primevue/card";
import Button from "primevue/button";
import UserFormDialog from "@/components/users/UserFormDialog.vue";

const authStore = useAuthStore();
const userStore = useUserStore();
const { user, isAdmin } = storeToRefs(authStore);
const { isLoading } = storeToRefs(userStore);

const showDialog = ref(false);
const editUser = ref({});

const openDialog = () => {
  editUser.value = { ...user.value };
  showDialog.value = true;
};

const handleSave = async (payload) => {
  let success = true;

  const userId = payload.id?.value || payload.id;

  if (payload.username) {
    success = await userStore.updateUser(userId, payload.username);
  }

  if (success && payload.password) {
    success = await userStore.updateUserPassword(userId, payload.password);
  }

  if (success) {
    showDialog.value = false;
    if (payload.username) {
      authStore.setUser({ ...user.value, username: payload.username });
    }
  }
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-3xl font-bold">Profile</h1>

    <Card>
      <template #content>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-4">
            <div>
              <label class="font-semibold text-sm text-muted-color"
                >Username</label
              >
              <p class="text-lg mt-1">{{ user?.username }}</p>
            </div>
            <div>
              <label class="font-semibold text-sm text-muted-color">Role</label>
              <p class="text-lg mt-1 capitalize">{{ user?.role }}</p>
            </div>
          </div>

          <div class="pt-4 border-t">
            <Button
              label="Edit Profile"
              icon="pi pi-user-edit"
              @click="openDialog"
            />
          </div>
        </div>
      </template>
    </Card>

    <UserFormDialog
      v-model:visible="showDialog"
      v-model:user="editUser"
      :loading="isLoading"
      :is-admin-editing-own-profile="isAdmin"
      @save="handleSave"
      @cancel="showDialog = false"
    />
  </div>
</template>
