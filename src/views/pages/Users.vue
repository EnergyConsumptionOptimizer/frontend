<script setup>
import { onMounted, ref } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { useUserCrudForm } from "@/composables/useUserCrudForm";

const {
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
} = useUserCrudForm();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

onMounted(loadUsers);
</script>

<template>
  <div class="card">
    <Toolbar class="mb-6">
      <template #start>
        <Button
          label="New"
          icon="pi pi-plus"
          severity="secondary"
          class="mr-2"
          @click="openNew"
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          severity="secondary"
          @click="confirmDeleteSelected"
          :disabled="!selectedUsers.length"
        />
      </template>
    </Toolbar>

    <DataTable
      v-model:selection="selectedUsers"
      :value="users"
      :loading="loading"
      dataKey="id"
      :paginator="true"
      :rows="10"
      :filters="filters"
    >
      <template #header>
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <h4 class="m-0">Users</h4>
          <IconField>
            <InputIcon><i class="pi pi-search" /></InputIcon>
            <InputText
              v-model="filters['global'].value"
              placeholder="Search..."
            />
          </IconField>
        </div>
      </template>

      <Column selectionMode="multiple" style="width: 3rem" />
      <Column field="username" header="Username" sortable />
      <Column field="role" header="Role" sortable />
      <Column style="width: 10rem">
        <template #body="{ data }">
          <Button
            icon="pi pi-pencil"
            outlined
            rounded
            class="mr-2"
            @click="openEdit(data)"
          />
          <Button
            icon="pi pi-trash"
            outlined
            rounded
            severity="danger"
            @click="confirmDeleteUser(data)"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="userDialog"
      :style="{ width: '450px' }"
      header="User Details"
      :modal="true"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label for="username" class="font-bold block mb-2">Username</label>
          <InputText
            id="username"
            v-model.trim="user.username"
            required
            autofocus
            :invalid="submitted && !user.username"
            fluid
          />
          <small v-if="submitted && !user.username" class="text-red-500"
            >Username is required.</small
          >
        </div>
        <div v-if="!user.id">
          <label for="password" class="font-bold block mb-2">Password</label>
          <Password
            id="password"
            v-model.trim="user.password"
            toggleMask
            :feedback="false"
            :invalid="submitted && !user.password"
            fluid
          />
          <small v-if="submitted && !user.password" class="text-red-500"
            >Password is required.</small
          >
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button
          label="Save"
          icon="pi pi-check"
          @click="saveUser"
          :loading="loading"
        />
      </template>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>
