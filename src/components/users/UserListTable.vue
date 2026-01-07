<script setup>
import { ref } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import CrudToolbar from "@/components/common/CrudToolbar.vue";

defineProps({
  users: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const selectedUsers = defineModel("selectedUsers", { default: [] });

const emit = defineEmits(["create", "delete-selected", "edit", "delete"]);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>

<template>
  <div>
    <CrudToolbar
      :selected-items="selectedUsers"
      @create="emit('create')"
      @delete-selected="emit('delete-selected')"
    />

    <DataTable
      v-model:selection="selectedUsers"
      :value="users"
      :loading="loading"
      dataKey="id"
      :paginator="true"
      :rows="10"
      :filters="filters"
      :globalFilterFields="['username', 'role']"
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
            @click="emit('edit', data)"
          />
          <Button
            icon="pi pi-trash"
            outlined
            rounded
            severity="danger"
            @click="emit('delete', data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
