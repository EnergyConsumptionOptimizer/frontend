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
  bypassSync: { type: Boolean, default: false },
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
const isSynced = ref(false);
const syncFailed = ref(false);

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
    isSynced.value &&
    !!smartFurnitureHookup.value?.endpoint?.trim() &&
    !!smartFurnitureHookup.value?.name?.trim() &&
    isEndpointLocalValid.value &&
    isNameLocalValid.value
  );
});

watch(visible, (isOpen) => {
  if (isOpen) {
    submitted.value = false;
    isSynced.value = !!smartFurnitureHookup.value?.id || props.bypassSync;
    syncFailed.value = false;
    if (interactiveMapStore.error) interactiveMapStore.clearError();
  }
});

watch(
  () => smartFurnitureHookup.value?.endpoint,
  (newVal, oldVal) => {
    if (visible.value && newVal !== oldVal && oldVal !== undefined) {
      if (!props.bypassSync) {
        isSynced.value = false;
        syncFailed.value = false;
        if (!smartFurnitureHookup.value.id) {
          smartFurnitureHookup.value.name = "";
          smartFurnitureHookup.value.utilityType = null;
        }
      }
      if (interactiveMapStore.error) interactiveMapStore.clearError();
    }
  },
);

watch(loading, (isLoading, wasLoading) => {
  if (wasLoading && !isLoading && smartFurnitureHookup.value?.endpoint) {
    const hasValidData =
      smartFurnitureHookup.value?.utilityType &&
      smartFurnitureHookup.value?.name;

    if (!error.value && hasValidData) {
      isSynced.value = true;
      syncFailed.value = false;
    } else {
      syncFailed.value = true;
      isSynced.value = false;
    }
  }
});

const clearError = () => {
  if (interactiveMapStore.error) interactiveMapStore.clearError();
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
  props.isOnDrawMode ? "Create Hookup" : "Edit Hookup",
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
      class="flex flex-col gap-6"
      novalidate
      aria-label="Smart furniture hookup form"
    >
      <Message
        v-if="globalError"
        severity="error"
        variant="simple"
        class="mb-2"
        role="alert"
        aria-live="assertive"
      >
        {{ globalError }}
      </Message>

      <div class="flex flex-col gap-2">
        <label for="hookupEndpoint" class="font-semibold text-base">
          Endpoint <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <div class="flex gap-2">
          <InputText
            id="hookupEndpoint"
            v-model.trim="smartFurnitureHookup.endpoint"
            type="url"
            autocomplete="off"
            autofocus
            class="flex-1 min-h-11"
            :invalid="
              !!endpointError || (submitted && !smartFurnitureHookup.endpoint)
            "
            :aria-invalid="
              !!endpointError || (submitted && !smartFurnitureHookup.endpoint)
            "
            aria-describedby="endpoint-error"
            aria-required="true"
            placeholder="Enter endpoint URL"
            fluid
            @input="clearError"
            @update:modelValue="emit('endpointUpdated')"
          />
          <Button
            type="button"
            icon="pi pi-sync"
            class="min-w-11 min-h-11"
            :loading="loading"
            :disabled="!smartFurnitureHookup.endpoint || loading"
            aria-label="Sync utility information from endpoint"
            @click="emit('fetchInfo')"
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
          {{ endpointError || "Endpoint is required." }}
        </Message>
        <Message
          v-else-if="syncFailed"
          severity="error"
          variant="simple"
          size="small"
          role="alert"
          aria-live="polite"
        >
          Hookup failed to sync
        </Message>
        <Message
          v-else-if="isSynced"
          severity="success"
          variant="simple"
          size="small"
          role="status"
          aria-live="polite"
        >
          Endpoint verified successfully
        </Message>
      </div>

      <div v-if="isSynced" class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <label for="hookupName" class="font-semibold text-base">
            Name <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <InputText
            id="hookupName"
            v-model.trim="smartFurnitureHookup.name"
            type="text"
            autocomplete="off"
            class="w-full min-h-11"
            :invalid="!!nameError || (submitted && !smartFurnitureHookup.name)"
            :aria-invalid="
              !!nameError || (submitted && !smartFurnitureHookup.name)
            "
            aria-describedby="name-error"
            aria-required="true"
            placeholder="Enter hookup name"
            fluid
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
            {{ nameError || "Name is required." }}
          </Message>
        </div>

        <div
          v-if="smartFurnitureHookup.utilityType"
          class="flex flex-col gap-2"
        >
          <label class="font-semibold text-base">Utility Type</label>
          <div
            class="px-3 py-2.5 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300"
            role="status"
            aria-live="polite"
          >
            {{ smartFurnitureHookup.utilityType }}
          </div>
        </div>
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
          v-if="isSynced"
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
