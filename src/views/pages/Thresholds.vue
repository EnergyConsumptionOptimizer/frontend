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
  handleTypeChange,
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
            @update:model-value="() => toggleStatus(data)"
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
      <form
        id="thresholdForm"
        @submit.prevent="saveThreshold"
        class="flex flex-col gap-4"
      >
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
          <small v-if="submitted && !threshold.name" class="text-red-500">
            Name is required.
          </small>
        </div>

        <div>
          <label for="utility" class="font-bold block mb-2">Utility</label>
          <Select
            id="utility"
            v-model="threshold.utilityType"
            :options="options.utilities"
            placeholder="Select Utility"
            :invalid="submitted && !threshold.utilityType"
            fluid
          />
          <small
            v-if="submitted && !threshold.utilityType"
            class="text-red-500"
          >
            Utility is required.
          </small>
        </div>

        <div>
          <label for="type" class="font-bold block mb-2">Threshold Type</label>
          <Select
            id="type"
            v-model="threshold.thresholdType"
            :options="options.types"
            placeholder="Select Type"
            :invalid="submitted && !threshold.thresholdType"
            fluid
            @change="handleTypeChange"
          />
          <small
            v-if="submitted && !threshold.thresholdType"
            class="text-red-500"
          >
            Type is required.
          </small>
        </div>

        <div>
          <label for="value" class="font-bold block mb-2">Value</label>
          <InputNumber
            id="value"
            v-model.number="threshold.value"
            :min="0"
            :invalid="submitted && (!threshold.value || threshold.value <= 0)"
            fluid
          />
          <small
            v-if="submitted && (!threshold.value || threshold.value <= 0)"
            class="text-red-500"
          >
            Value must be a positive number.
          </small>
        </div>

        <div>
          <label for="periodType" class="font-bold block mb-2"
            >Period Type</label
          >
          <Select
            id="periodType"
            v-model="threshold.periodType"
            :options="options.periods"
            placeholder="Select Period"
            :disabled="isPeriodDisabled"
            fluid
          />
        </div>

        <div>
          <label for="status" class="font-bold block mb-2">State</label>
          <Select
            id="status"
            v-model="threshold.thresholdState"
            :options="statusOptions"
            placeholder="Select State"
            fluid
          />
        </div>
      </form>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />

        <Button
          label="Save"
          icon="pi pi-check"
          type="submit"
          form="thresholdForm"
          :loading="loading"
        />
      </template>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>
