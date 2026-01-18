<script setup>
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Message from "primevue/message";
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";
import { useNameValidation } from "@/composables/common/useNameValidation";
import { useServerFormErrors } from "@/composables/useServerFormErrors";

const props = defineProps({
  isOnDrawMode: Boolean,
  saving: { type: Boolean, default: false },
});

const smartFurnitureHookup = defineModel("smartFurnitureHookup", {
  type: Object,
  required: true,
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

const interactiveMapStore = useInteractiveMapStore();
const { smartFurnitureHookups, error } = storeToRefs(interactiveMapStore);
const { getError: getServerError, formGlobalError } =
  useServerFormErrors(error);

const submitted = ref(false);

const endpointRef = computed(() => smartFurnitureHookup.value?.endpoint);
const nameRef = computed(() => smartFurnitureHookup.value?.name);
const idRef = computed(() => smartFurnitureHookup.value?.id);

const { validationError: endpointLocalError, isValid: isEndpointLocalValid } =
  useNameValidation(endpointRef, smartFurnitureHookups, idRef, "endpoint");

const { validationError: nameLocalError, isValid: isNameLocalValid } =
  useNameValidation(nameRef, smartFurnitureHookups, idRef, "name");

const endpointError = computed(
  () => getServerError("endpoint") || endpointLocalError.value,
);
const nameError = computed(
  () => getServerError("name") || nameLocalError.value,
);

const isFormValid = computed(() => {
  return (
    !!smartFurnitureHookup.value?.endpoint?.trim() &&
    !!smartFurnitureHookup.value?.name?.trim() &&
    isEndpointLocalValid.value &&
    isNameLocalValid.value
  );
});

const utilityTypeLabel = computed(() => {
  const type = smartFurnitureHookup.value?.utilityType;
  if (type) {
    return type;
  }
  return "Sync the information to see the utility type";
});

watch(visible, (isOpen) => {
  if (isOpen) {
    submitted.value = false;
    if (interactiveMapStore.error) interactiveMapStore.error = null;
  }
});

const clearError = () => {
  if (interactiveMapStore.error) interactiveMapStore.error = null;
};

function onSave() {
  submitted.value = true;
  if (!isFormValid.value) return;
  emit("save", {
    id: smartFurnitureHookup.value.id ?? null,
    name: smartFurnitureHookup.value.name.trim(),
    endpoint: smartFurnitureHookup.value.endpoint.trim(),
    utilityType: smartFurnitureHookup.value.utilityType ?? null,
  });
}

const dialogTitle = computed(() =>
  props.isOnDrawMode
    ? "Create new smart furniture hookup"
    : "Edit smart furniture hookup",
);
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
      Smart furniture hookup information. Click the button to sync the
      information.
    </span>
    <form id="sfh-form" @submit.prevent="onSave" novalidate>
      <Message
        v-if="formGlobalError"
        severity="error"
        variant="simple"
        class="mb-2"
      >
        {{ formGlobalError }}
      </Message>

      <div class="grid grid-cols-12 gap-2 mb-4">
        <label
          for="smartFurnitureHookupEndpoint"
          class="flex items-center col-span-12 md:col-span-2 md:mb-0 font-semibold"
        >
          Endpoint
        </label>
        <div class="col-span-12 md:col-span-10 w-full flex space-x-4">
          <InputText
            id="smartFurnitureHookupEndpoint"
            autocomplete="off"
            type="text"
            class="w-full"
            v-model.trim="smartFurnitureHookup.endpoint"
            :invalid="
              !!endpointError || (submitted && !smartFurnitureHookup.endpoint)
            "
            aria-describedby="endpoint-error"
            @update:modelValue="emit('endpointUpdated')"
            @input="clearError"
          />
          <Button
            :disabled="!smartFurnitureHookup.endpoint"
            :loading="loading"
            type="button"
            icon="pi pi-link"
            aria-label="Sync Utility Info"
            severity="secondary"
            class="col-span-12 md:col-span-10"
            @click="emit('fetchInfo')"
            v-tooltip="'Sync Utility Info'"
          />
        </div>
        <Message
          class="col-span-12"
          id="endpoint-error"
          v-if="endpointError || (submitted && !smartFurnitureHookup.endpoint)"
          severity="error"
          variant="simple"
          size="small"
        >
          {{ endpointError || "Endpoint is required" }}
        </Message>
      </div>

      <div class="grid grid-cols-12 gap-2 mb-4">
        <label
          for="smartFurnitureHookupName"
          class="flex items-center col-span-12 md:col-span-2 md:mb-0 font-semibold"
        >
          Name
        </label>
        <div class="col-span-12 md:col-span-10 w-full flex space-x-4">
          <InputText
            id="smartFurnitureHookupName"
            autocomplete="off"
            type="text"
            class="w-full"
            v-model.trim="smartFurnitureHookup.name"
            :invalid="!!nameError || (submitted && !smartFurnitureHookup.name)"
            aria-describedby="name-error"
            @input="clearError"
          />
        </div>
        <Message
          class="col-span-12"
          id="name-error"
          v-if="nameError || (submitted && !smartFurnitureHookup.name)"
          severity="error"
          variant="simple"
          size="small"
        >
          {{ nameError || "Name is required" }}
        </Message>
      </div>

      <div class="grid grid-cols-12 gap-2 mb-4">
        <label
          for="smartFurnitureHookupUtilityType"
          class="flex items-center col-span-12 md:col-span-2 md:mb-0 font-semibold"
        >
          Utility type
        </label>
        <div class="col-span-12 md:col-span-10 w-full flex space-x-4">
          <span id="smartFurnitureHookupUtilityType">{{
            utilityTypeLabel
          }}</span>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="emit('cancel')"
        />
        <Button
          type="submit"
          form="sfh-form"
          label="Save"
          :loading="saving"
          :disabled="!isFormValid || saving"
        />
      </div>
    </template>
  </Dialog>
</template>
