<script setup>
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import ColorPicker from "primevue/colorpicker";
import Button from "primevue/button";
import Message from "primevue/message";
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";
import { useUniqueFieldValidation } from "@/composables/common/useUniqueFieldValidation.js";
import { useServerFormErrors } from "@/composables/useServerFormErrors";

const props = defineProps({
  isOnDrawMode: Boolean,
  defaultColor: { type: String, default: "#3b82f6" },
  loading: { type: Boolean, default: false },
});

const zone = defineModel("zone", { type: Object, required: true });
const visible = defineModel("visible", { type: Boolean, default: false });
const colorInput = defineModel("colorInput", { type: String, default: "#fff" });
const emit = defineEmits(["hide", "save", "cancel"]);

const store = useInteractiveMapStore();
const { zones, error } = storeToRefs(store);
const { getFieldError: getServerError, globalError } =
  useServerFormErrors(error);

const submitted = ref(false);

const nameRef = computed(() => zone.value?.name);
const idRef = computed(() => zone.value?.id);

const { validationError: localValidationError, isValid: isNameLocalValid } =
  useUniqueFieldValidation(nameRef, zones, idRef, "name");

const nameError = computed(
  () => getServerError("name") || localValidationError.value,
);

const isFormValid = computed(() => {
  const name = zone.value?.name?.trim();
  return name && name.length > 0 && isNameLocalValid.value;
});

watch(visible, (isOpen) => {
  if (!isOpen) {
    submitted.value = false;
    if (store.error) store.clearError();
  }
});

const clearError = () => {
  if (store.error) store.clearError();
};

function onSave() {
  if (!isFormValid.value) {
    submitted.value = true;
    return;
  }

  const zoneColor = colorInput.value;

  emit("save", {
    id: zone.value?.id ?? null,
    name: zone.value.name.trim(),
    color: zoneColor.startsWith("#")
      ? zoneColor
      : "#" + zoneColor || props.defaultColor,
  });
}

const dialogTitle = computed(() =>
  props.isOnDrawMode ? "Create new zone" : "Edit zone",
);
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="dialogTitle"
    class="w-full max-w-md mx-4"
    @hide="emit('hide')"
  >
    <form
      id="zone-form"
      @submit.prevent="onSave"
      novalidate
      aria-label="Zone information form"
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
        <label for="zoneName" class="font-semibold text-base">
          Name <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <InputText
          id="zoneName"
          class="w-full min-h-11"
          autocomplete="off"
          v-model.trim="zone.name"
          :invalid="!!nameError || (submitted && !zone.name)"
          :aria-invalid="!!nameError || (submitted && !zone.name)"
          aria-describedby="zoneName-error"
          autofocus
          @input="clearError"
        />
        <Message
          id="zoneName-error"
          v-if="nameError || (submitted && !zone.name)"
          severity="error"
          variant="simple"
          size="small"
          aria-live="polite"
        >
          {{ nameError || "Zone name is required" }}
        </Message>
      </div>

      <div class="flex flex-col gap-2 mb-6">
        <label for="zoneColor" class="font-semibold text-base"> Color </label>
        <ColorPicker
          inputId="zoneColor"
          v-model="colorInput"
          format="hex"
          pt:root:class="flex-1 flex !w-full"
          pt:preview:class="flex-1 !h-8 !w-full"
        />
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
          aria-label="Cancel zone editing"
        />
        <Button
          type="submit"
          form="zone-form"
          label="Save"
          class="min-h-11 w-full sm:w-auto"
          :loading="loading"
          :disabled="loading"
          :aria-label="isOnDrawMode ? 'Save new zone' : 'Save zone changes'"
        />
      </div>
    </template>
  </Dialog>
</template>
