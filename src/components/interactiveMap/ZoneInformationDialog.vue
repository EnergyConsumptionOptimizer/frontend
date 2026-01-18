<script setup>
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import ColorPicker from "primevue/colorpicker";
import Button from "primevue/button";
import Message from "primevue/message";
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";
import { useNameValidation } from "@/composables/common/useNameValidation";
import { useServerFormErrors } from "@/composables/useServerFormErrors";

const props = defineProps({
  isOnDrawMode: Boolean,
  defaultColor: { type: String, default: "#3b82f6" },
  loading: { type: Boolean, default: false },
});

const zone = defineModel("zone", { type: Object, required: true });
const visible = defineModel("visible", { type: Boolean, default: false });
const emit = defineEmits(["hide", "save", "cancel"]);

const store = useInteractiveMapStore();
const { zones, error } = storeToRefs(store);
const { getError: getServerError, formGlobalError } =
  useServerFormErrors(error);

const submitted = ref(false);

const nameRef = computed(() => zone.value?.name);
const idRef = computed(() => zone.value?.id);

const { validationError: localValidationError, isValid: isNameLocalValid } =
  useNameValidation(nameRef, zones, idRef, "name");

const nameError = computed(
  () => getServerError("name") || localValidationError.value,
);

const isFormValid = computed(() => {
  const name = zone.value?.name?.trim();
  return name && name.length > 0 && isNameLocalValid.value;
});

const activeColor = computed({
  get: () => zone.value?.color || props.defaultColor,
  set: (val) => {
    if (zone.value) zone.value.color = "#" + val;
  },
});

watch(visible, (isOpen) => {
  if (isOpen) {
    submitted.value = false;
    if (store.error) store.error = null;
  }
});

const clearError = () => {
  if (store.error) store.error = null;
};

function onSave() {
  submitted.value = true;
  if (!isFormValid.value) return;
  emit("save", {
    id: zone.value?.id ?? null,
    name: zone.value.name.trim(),
    color: zone.value?.color || props.defaultColor,
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
    :style="{ width: '25rem' }"
    @hide="emit('hide')"
  >
    <span class="text-surface-500 dark:text-surface-400 block mb-8">
      Zone Information
    </span>
    <form id="zone-form" @submit.prevent="onSave" novalidate>
      <Message
        v-if="formGlobalError"
        severity="error"
        variant="simple"
        class="mb-2"
      >
        {{ formGlobalError }}
      </Message>

      <div class="flex items-center gap-4 mb-4">
        <label for="zoneName" class="font-semibold">Name</label>
        <div class="flex flex-col gap-1 w-full">
          <InputText
            id="zoneName"
            class="flex-auto"
            autocomplete="off"
            v-model.trim="zone.name"
            :invalid="!!nameError || (submitted && !zone.name)"
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
          >
            {{ nameError || "Zone name is required" }}
          </Message>
        </div>
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="zoneColor" class="font-semibold">Color</label>
        <ColorPicker
          inputId="zoneColor"
          v-model="activeColor"
          format="hex"
          pt:root:class="flex-1 flex !w-full"
          pt:preview:class="flex-1 !h-8 !w-full"
        />
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
          form="zone-form"
          label="Save"
          :loading="loading"
          :disabled="loading"
        />
      </div>
    </template>
  </Dialog>
</template>
