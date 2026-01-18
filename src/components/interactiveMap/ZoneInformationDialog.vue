<script setup>
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import ColorPicker from "primevue/colorpicker";
import Button from "primevue/button";
import Message from "primevue/message";
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";
import { useNameValidation } from "@/composables/common/useNameValidation";

const props = defineProps({
  isOnDrawMode: Boolean,
  defaultColor: { type: String, default: "#3b82f6" },
});

const zone = defineModel("zone", { type: Object, required: true });
const visible = defineModel("visible", { type: Boolean, default: false });

const emit = defineEmits(["hide", "save", "cancel"]);

const store = useInteractiveMapStore();
const { zones } = storeToRefs(store);

const submitted = ref(false);

const nameRef = computed(() => zone.value?.name);
const idRef = computed(() => zone.value?.id);

const { validationError, isValid: isNameUnique } = useNameValidation(
  nameRef,
  zones,
  idRef,
  "name",
);

const isFormValid = computed(() => {
  const name = zone.value?.name?.trim();
  return name && name.length > 0 && isNameUnique.value;
});

const activeColor = computed({
  get: () => zone.value?.color || props.defaultColor,
  set: (val) => {
    if (zone.value) zone.value.color = val;
  },
});

function onSave() {
  submitted.value = true;
  if (!isFormValid.value) return;

  emit("save", {
    id: zone.value?.id ?? null,
    name: zone.value.name.trim(),
    color: "#" + zone.value?.color || props.defaultColor,
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
    <span class="text-surface-500 dark:text-surface-400 block mb-8"
      >Zone Information</span
    >

    <div class="flex items-center gap-4 mb-4">
      <label for="zoneName" class="font-semibold">Name</label>
      <div class="flex flex-col gap-1 w-full">
        <InputText
          id="zoneName"
          class="flex-auto"
          autocomplete="off"
          v-model.trim="zone.name"
          :invalid="!!validationError || (submitted && !zone.name)"
          autofocus
        />
        <Message
          v-if="validationError || (submitted && !zone.name)"
          severity="error"
          variant="simple"
          size="small"
        >
          {{ validationError || "Zone name is required" }}
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
        @click="onSave"
        :disabled="!isFormValid"
      />
    </div>
  </Dialog>
</template>
