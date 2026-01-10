<script setup>
import Dialog from "primevue/dialog";
import { computed } from "vue";

const props = defineProps({
  isOnDrawMode: Boolean,
});

const smartFurnitureHookup = defineModel("smartFurnitureHookup", {
  type: Object,
});

const visible = defineModel("visible", { type: Boolean, default: false });
const loading = defineModel("loading", { type: Boolean });

const emit = defineEmits([
  "hide",
  "fetchInfo",
  "save",
  "cancel",
  "endpointUpdated",
]);

const dialogTitle = computed(() =>
  props.isOnDrawMode
    ? "Create new smart furniture hookup"
    : "Edit smart furniture hookup",
);

const utilityTypeLabel = computed(() => {
  const type = smartFurnitureHookup.value?.utilityType;

  if (type) {
    return type;
  }
  return "Sync the information to see the utility type";
});

function endpointUpdated() {
  emit("endpointUpdated");
  if (!props.isOnDrawMode) emit("endpointUpdated");
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="dialogTitle"
    :style="{ width: '35rem' }"
    @hide="emit('hide')"
  >
    <span class="text-surface-500 dark:text-surface-400 block mb-8">
      Smart furniture hookup information. Click the link to button to sync the
      information
    </span>

    <div class="grid grid-cols-12 gap-2 mb-4">
      <label
        for="smartFurnitureHookupEndpoint"
        class="flex items-center col-span-12 md:col-span-2 md:mb-0 font-semibold"
        >Endpoint</label
      >
      <div class="col-span-12 md:col-span-10 w-full flex space-x-4">
        <InputText
          id="smartFurnitureHookupEndpoint"
          autocomplete="off"
          type="text"
          class="w-full"
          v-model="smartFurnitureHookup.endpoint"
          :invalid="!smartFurnitureHookup.endpoint"
          @update:modelValue="endpointUpdated"
        />
        <Button
          :disabled="!smartFurnitureHookup.endpoint"
          :loading="loading"
          icon="pi pi-link"
          aria-label="Connect"
          severity="secondary"
          class="col-span-12 md:col-span-10"
          @click="emit('fetchInfo')"
        />
      </div>
      <Message
        class="col-span-12"
        v-show="!smartFurnitureHookup.endpoint"
        severity="error"
        variant="simple"
        size="small"
        >Endpoint is required
      </Message>
    </div>

    <div class="grid grid-cols-12 gap-2 mb-4">
      <label
        for="smartFurnitureHookupName"
        class="flex items-center col-span-12 md:col-span-2 md:mb-0 font-semibold"
        >Name</label
      >
      <div class="col-span-12 md:col-span-10 w-full flex space-x-4">
        <InputText
          id="smartFurnitureHookupName"
          autocomplete="off"
          type="text"
          class="w-full"
          v-model="smartFurnitureHookup.name"
        />
      </div>
    </div>

    <div class="grid grid-cols-12 gap-2 mb-4">
      <label
        for="smartFurnitureHookupUtilityType"
        class="flex items-center col-span-12 md:col-span-2 md:mb-0 font-semibold"
        >Utility type</label
      >
      <div class="col-span-12 md:col-span-10 w-full flex space-x-4">
        <span>{{ utilityTypeLabel }}</span>
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="emit('cancel')"
      />
      <Button
        type="button"
        label="Save"
        @click="emit('save')"
        :disabled="!smartFurnitureHookup.endpoint"
      />
    </div>
  </Dialog>
</template>

<style scoped></style>
