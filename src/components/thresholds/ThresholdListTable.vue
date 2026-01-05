<script setup>
import { ref } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import CrudToolbar from "@/components/common/CrudToolbar.vue";

defineProps({
  thresholds: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const selectedThresholds = defineModel("selection");

defineEmits(["edit", "delete", "delete-selected", "toggle-status", "create"]);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>

<template>
  <CrudToolbar
    :selected-items="selectedThresholds"
    @create="$emit('create')"
    @delete-selected="$emit('delete-selected')"
  />

  <DataTable
    v-model:selection="selectedThresholds"
    :value="thresholds"
    dataKey="id"
    :paginator="true"
    :rows="10"
    :filters="filters"
    :loading="loading"
  >
    <template #header>
      <div class="flex justify-between items-center">
        <h4 class="m-0">Thresholds</h4>
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

    <Column field="name" header="Name" sortable style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.name }}
      </template>
    </Column>

    <Column
      field="thresholdType"
      header="Threshold Type"
      sortable
      style="min-width: 12rem"
    >
      <template #body="{ data }">
        {{ data.thresholdType || "-" }}
      </template>
    </Column>
    <Column field="utilityType" header="Utility" sortable>
      <template #body="{ data }">
        {{ data.utilityType || "-" }}
      </template>
    </Column>

    <Column field="value" header="Value" sortable>
      <template #body="{ data }">
        {{ data.value ?? "-" }}
      </template>
    </Column>

    <Column field="periodType" header="Period" sortable>
      <template #body="{ data }">
        {{ data.periodType || "-" }}
      </template>
    </Column>

    <Column field="thresholdState" header="State" style="width: 8rem">
      <template #body="{ data }">
        <ToggleSwitch
          :model-value="data.thresholdState === 'ENABLED'"
          @update:model-value="() => $emit('toggle-status', data)"
        />
      </template>
    </Column>

    <Column style="min-width: 10rem">
      <template #body="{ data }">
        <Button
          icon="pi pi-pencil"
          outlined
          rounded
          class="mr-2"
          @click="$emit('edit', data)"
        />
        <Button
          icon="pi pi-trash"
          outlined
          rounded
          severity="danger"
          @click="$emit('delete', data)"
        />
      </template>
    </Column>
  </DataTable>
</template>
