<script setup>
import { onMounted, ref } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { useThresholdsCrudForm } from "@/composables/useThresholdsCrudForm";

const {
  thresholds,
  threshold,
  selectedThresholds,
  loading,
  dialog,
  submitted,
  options,
  isPeriodDisabled,
  statusOptions,
  loadThresholds,
  saveThreshold,
  toggleStatus,
  confirmDelete,
  confirmDeleteSelected,
  openNew,
  openEdit,
  hideDialog,
} = useThresholdsCrudForm();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

onMounted(loadThresholds);
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
          :disabled="!selectedThresholds.length"
        />
      </template>
    </Toolbar>

    <DataTable
      v-model:selection="selectedThresholds"
      :value="thresholds"
      dataKey="id"
      :paginator="true"
      :rows="10"
      :filters="filters"
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
      <Column field="id" header="ID" sortable style="min-width: 8rem" />
      <Column field="name" header="Name" sortable style="min-width: 12rem" />
      <Column field="utility" header="Utility" sortable />
      <Column field="type" header="Type" sortable />

      <Column field="periodType" header="Period" sortable>
        <template #body="{ data }">
          {{ data.periodType || "-" }}
        </template>
      </Column>

      <Column field="status" header="Active" style="width: 6rem">
        <template #body="{ data }">
          <ToggleSwitch
            :model-value="data.status === 'ACTIVE'"
            @update:model-value="toggleStatus(data)"
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
            @click="openEdit(data)"
          />
          <Button
            icon="pi pi-trash"
            outlined
            rounded
            severity="danger"
            @click="confirmDelete(data)"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="dialog"
      :style="{ width: '450px' }"
      header="Threshold Details"
      :modal="true"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label for="name" class="font-bold block mb-2">Name</label>
          <InputText
            id="name"
            v-model.trim="threshold.name"
            required
            autofocus
            :invalid="submitted && !threshold.name"
            fluid
          />
          <small v-if="submitted && !threshold.name" class="text-red-500"
            >Name is required.</small
          >
        </div>

        <div>
          <label for="utility" class="font-bold block mb-2">Utility</label>
          <Dropdown
            id="utility"
            v-model="threshold.utility"
            :options="options.utilities"
            placeholder="Select Utility"
            :invalid="submitted && !threshold.utility"
            fluid
          />
          <small v-if="submitted && !threshold.utility" class="text-red-500"
            >Utility is required.</small
          >
        </div>

        <div>
          <label for="type" class="font-bold block mb-2">Type</label>
          <Dropdown
            id="type"
            v-model="threshold.type"
            :options="options.types"
            placeholder="Select Type"
            :invalid="submitted && !threshold.type"
            fluid
            @change="handleTypeChange"
          />
          <small v-if="submitted && !threshold.type" class="text-red-500"
            >Type is required.</small
          >
        </div>

        <div>
          <label for="periodType" class="font-bold block mb-2"
            >Period Type</label
          >
          <Dropdown
            id="periodType"
            v-model="threshold.periodType"
            :options="options.periods"
            placeholder="Select Period"
            :disabled="isPeriodDisabled"
            fluid
          />
        </div>

        <div>
          <label for="status" class="font-bold block mb-2">Status</label>
          <Dropdown
            id="status"
            v-model="threshold.status"
            :options="statusOptions"
            placeholder="Select Status"
            fluid
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button
          label="Save"
          icon="pi pi-check"
          @click="saveThreshold"
          :loading="loading"
        />
      </template>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>
