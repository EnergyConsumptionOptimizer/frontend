<script setup>
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Message from "primevue/message";
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";
import { useUniqueFieldValidation } from "@/composables/common/useUniqueFieldValidation.js";
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
const { getFieldError: getServerError, globalError } =
  useServerFormErrors(error);

const submitted = ref(false);

const endpointRef = computed(() => smartFurnitureHookup.value?.endpoint);
const nameRef = computed(() => smartFurnitureHookup.value?.name);
const idRef = computed(() => smartFurnitureHookup.value?.id);

const { validationError: endpointLocalError, isValid: isEndpointLocalValid } =
  useUniqueFieldValidation(
    endpointRef,
    smartFurnitureHookups,
    idRef,
    "endpoint",
  );

const { validationError: nameLocalError, isValid: isNameLocalValid } =
  useUniqueFieldValidation(nameRef, smartFurnitureHookups, idRef, "name");

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

watch(visible, (isOpen) => {
  if (isOpen) {
    submitted.value = false;
    if (interactiveMapStore.error) interactiveMapStore.clearError();
  }
});

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
    class="w-full max-w-lg mx-4"
    @hide="emit('hide')"
  >
    <form
      id="sfh-form"
      @submit.prevent="onSave"
      novalidate
      aria-label="Smart furniture hookup information form"
    >
      <Message
        v-if="globalError"
        severity="error"
        variant="simple"
        class="mb-4"
        role="alert"
        aria-live="assertive"
      >
        {{ globalError }}
      </Message>

      <div class="flex flex-col gap-2 mb-6">
        <label
          for="smartFurnitureHookupEndpoint"
          class="font-semibold text-base"
        >
          Endpoint <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <div class="flex gap-2">
          <InputText
            id="smartFurnitureHookupEndpoint"
            autocomplete="off"
            type="text"
            class="flex-1 min-h-11"
            v-model.trim="smartFurnitureHookup.endpoint"
            :invalid="
              !!endpointError || (submitted && !smartFurnitureHookup.endpoint)
            "
            :aria-invalid="
              !!endpointError || (submitted && !smartFurnitureHookup.endpoint)
            "
            aria-describedby="endpoint-error"
            aria-required="true"
            placeholder="http://endpoint-url"
            @update:modelValue="emit('endpointUpdated')"
            @input="clearError"
          />
          <Button
            :disabled="!smartFurnitureHookup.endpoint"
            :loading="loading"
            type="button"
            icon="pi pi-link"
            class="min-w-11 min-h-11"
            aria-label="Sync utility information from endpoint"
            @click="emit('fetchInfo')"
            v-tooltip="'Sync Utility Info'"
          />
        </div>
        <Message
          id="endpoint-error"
          v-if="endpointError || (submitted && !smartFurnitureHookup.endpoint)"
          severity="error"
          variant="simple"
          size="small"
          role="alert"
          aria-live="polite"
        >
          {{ endpointError || "Endpoint is required" }}
        </Message>
      </div>

      <div class="flex flex-col gap-2 mb-6">
        <label for="smartFurnitureHookupName" class="font-semibold text-base">
          Name <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <InputText
          id="smartFurnitureHookupName"
          autocomplete="off"
          type="text"
          class="w-full min-h-11"
          v-model.trim="smartFurnitureHookup.name"
          :invalid="!!nameError || (submitted && !smartFurnitureHookup.name)"
          :aria-invalid="
            !!nameError || (submitted && !smartFurnitureHookup.name)
          "
          aria-describedby="name-error"
          aria-required="true"
          placeholder="Hookup name"
          @input="clearError"
        />
        <Message
          id="name-error"
          v-if="nameError || (submitted && !smartFurnitureHookup.name)"
          severity="error"
          variant="simple"
          size="small"
          role="alert"
          aria-live="polite"
        >
          {{ nameError || "Name is required" }}
        </Message>
      </div>

      <div
        v-if="smartFurnitureHookup.utilityType"
        class="flex flex-col gap-2 mb-6"
      >
        <label class="font-semibold text-base"> Utility type </label>
        <p
          class="text-surface-700 dark:text-surface-300 text-sm sm:text-base px-3 py-2 bg-surface-50 dark:bg-surface-800 rounded"
          role="status"
          aria-live="polite"
        >
          {{ smartFurnitureHookup.utilityType }}
        </p>
      </div>
    </form>

    <template #footer>
      <div class="flex flex-col sm:flex-row justify-end gap-3">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          outlined
          class="min-h-11 w-full sm:w-auto"
          @click="emit('cancel')"
          aria-label="Cancel hookup editing"
        />
        <Button
          type="submit"
          form="sfh-form"
          label="Save"
          class="min-h-11 w-full sm:w-auto"
          :loading="saving"
          :disabled="!isFormValid || saving"
          :aria-label="isOnDrawMode ? 'Save new hookup' : 'Save hookup changes'"
        />
      </div>
    </template>
  </Dialog>
</template>
