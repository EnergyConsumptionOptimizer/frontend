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
    :rowsPerPageOptions="[5, 10, 20]"
    :filters="filters"
    :loading="loading"
    :globalFilterFields="[
      'name',
      'thresholdType',
      'utilityType',
      'periodType',
      'thresholdState',
    ]"
    responsiveLayout="scroll"
    aria-label="Threshold management table"
  >
    <template #header>
      <div
        class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between"
      >
        <h2 class="m-0 text-xl sm:text-2xl font-semibold">Thresholds</h2>
        <IconField>
          <InputIcon><i class="pi pi-search" aria-hidden="true" /></InputIcon>
          <InputText
            v-model="filters['global'].value"
            placeholder="Search thresholds..."
            class="min-h-11"
            aria-label="Search thresholds by name, type, or utility"
          />
        </IconField>
      </div>
    </template>

    <template #empty>
      <div class="text-center p-4 text-surface-500 dark:text-surface-400">
        No thresholds found.
      </div>
    </template>

    <Column selectionMode="multiple" style="width: 3rem" :exportable="false" />

    <Column field="name" header="Name" sortable style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.name }}
      </template>
    </Column>

    <Column
      field="thresholdType"
      header="Type"
      sortable
      style="min-width: 10rem"
    >
      <template #body="{ data }">
        {{ data.thresholdType || "-" }}
      </template>
    </Column>

    <Column
      field="utilityType"
      header="Utility"
      sortable
      style="min-width: 8rem"
    >
      <template #body="{ data }">
        {{ data.utilityType || "-" }}
      </template>
    </Column>

    <Column field="value" header="Value" sortable style="min-width: 8rem">
      <template #body="{ data }">
        {{ data.value ?? "-" }}
      </template>
    </Column>

    <Column field="periodType" header="Period" sortable style="min-width: 8rem">
      <template #body="{ data }">
        {{ data.periodType || "-" }}
      </template>
    </Column>

    <Column field="thresholdState" header="State" style="width: 8rem">
      <template #body="{ data }">
        <ToggleSwitch
          :model-value="data.thresholdState === 'ENABLED'"
          :aria-label="`Toggle ${data.name} threshold: currently ${data.thresholdState === 'ENABLED' ? 'enabled' : 'disabled'}`"
          @update:model-value="() => $emit('toggle-status', data)"
        />
      </template>
    </Column>

    <Column header="Actions" style="min-width: 10rem" :exportable="false">
      <template #body="{ data }">
        <div class="flex gap-2">
          <Button
            icon="pi pi-pencil"
            rounded
            class="min-w-11 min-h-11"
            aria-label="Edit threshold"
            v-tooltip.top="'Edit'"
            @click="$emit('edit', data)"
          />
          <Button
            icon="pi pi-trash"
            rounded
            severity="danger"
            class="min-w-11 min-h-11"
            :aria-label="`Delete threshold ${data.name}`"
            v-tooltip.top="'Delete'"
            @click="$emit('delete', data)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>
