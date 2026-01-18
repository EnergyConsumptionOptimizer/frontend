<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useThresholdStore } from "@/stores/thresholdStore";
import { useNameValidation } from "@/composables/common/useNameValidation";
import { useServerFormErrors } from "@/composables/useServerFormErrors";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import Button from "primevue/button";
import Message from "primevue/message";

const props = defineProps({
  loading: { type: Boolean, default: false },
  options: {
    type: Object,
    default: () => ({ utilities: [], types: [], periods: [] }),
  },
  isPeriodDisabled: { type: Boolean, default: false },
  statusOptions: { type: Array, default: () => [] },
});

const threshold = defineModel("threshold", { required: true });
const visible = defineModel("visible", { type: Boolean, default: false });
const emit = defineEmits(["save", "cancel", "type-change"]);

const thresholdStore = useThresholdStore();
const { thresholds, error } = storeToRefs(thresholdStore);
const { getError: getServerError, formGlobalError } =
  useServerFormErrors(error);

const submitted = ref(false);

const nameRef = computed(() => threshold.value?.name);
const idRef = computed(() => threshold.value?.id);

const { validationError: localNameError, isValid: isNameUnique } =
  useNameValidation(nameRef, thresholds, idRef, "name");

const nameError = computed(
  () => getServerError("name") || localNameError.value,
);
const valueError = computed(() => getServerError("value"));
const periodError = computed(() => getServerError("periodType"));
const utilityError = computed(() => getServerError("utilityType"));
const typeError = computed(() => getServerError("thresholdType"));

const isFormValid = computed(() => {
  const t = threshold.value;
  if (!t) return false;
  const validName = !!t.name?.trim() && isNameUnique.value;
  const validUtility = !!t.utilityType;
  const validType = !!t.thresholdType;
  const validValue = t.value !== null && t.value !== undefined && t.value > 0;
  const validPeriod = props.isPeriodDisabled || !!t.periodType;
  return validName && validUtility && validType && validValue && validPeriod;
});

watch(visible, (isOpen) => {
  if (isOpen) {
    submitted.value = false;
    if (thresholdStore.error) thresholdStore.error = null;
  }
});

const clearError = () => {
  if (thresholdStore.error) thresholdStore.error = null;
};

function onSave() {
  submitted.value = true;
  if (!isFormValid.value) return;
  emit("save", {
    ...threshold.value,
    name: threshold.value.name.trim(),
    periodType: props.isPeriodDisabled ? "" : threshold.value.periodType,
  });
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :style="{ width: '450px' }"
    header="Threshold Details"
    modal
    class="p-fluid"
    @hide="emit('cancel')"
  >
    <form
      id="threshold-form"
      @submit.prevent="onSave"
      class="flex flex-col gap-4"
      novalidate
    >
      <Message
        v-if="formGlobalError"
        severity="error"
        variant="simple"
        class="mb-2"
      >
        {{ formGlobalError }}
      </Message>

      <div class="field">
        <label for="name" class="font-bold block mb-2">Name</label>
        <InputText
          id="name"
          v-model.trim="threshold.name"
          required
          autofocus
          :invalid="!!nameError || (submitted && !threshold.name)"
          aria-describedby="name-error"
          fluid
          @input="clearError"
        />
        <Message
          id="name-error"
          v-if="nameError || (submitted && !threshold.name)"
          severity="error"
          variant="simple"
          size="small"
        >
          {{ nameError || "Name is required." }}
        </Message>
      </div>

      <div class="field">
        <label for="utility" class="font-bold block mb-2">Utility</label>
        <Select
          id="utility"
          v-model="threshold.utilityType"
          :options="options.utilities"
          placeholder="Select Utility"
          :invalid="!!utilityError || (submitted && !threshold.utilityType)"
          aria-describedby="utility-error"
          fluid
          @change="clearError"
        />
        <Message
          id="utility-error"
          v-if="utilityError || (submitted && !threshold.utilityType)"
          severity="error"
          variant="simple"
          size="small"
        >
          {{ utilityError || "Utility is required." }}
        </Message>
      </div>

      <div class="field">
        <label for="type" class="font-bold block mb-2">Threshold Type</label>
        <Select
          id="type"
          v-model="threshold.thresholdType"
          :options="options.types"
          placeholder="Select Type"
          :invalid="!!typeError || (submitted && !threshold.thresholdType)"
          aria-describedby="type-error"
          fluid
          @change="
            (e) => {
              $emit('type-change');
              clearError();
            }
          "
        />
        <Message
          id="type-error"
          v-if="typeError || (submitted && !threshold.thresholdType)"
          severity="error"
          variant="simple"
          size="small"
        >
          {{ typeError || "Type is required." }}
        </Message>
      </div>

      <div class="field">
        <label for="value" class="font-bold block mb-2">Value</label>
        <InputNumber
          id="value"
          v-model.number="threshold.value"
          :min="0"
          :invalid="
            !!valueError ||
            (submitted && (!threshold.value || threshold.value <= 0))
          "
          aria-describedby="value-error"
          fluid
          @input="clearError"
        />
        <Message
          id="value-error"
          v-if="
            valueError ||
            (submitted && (!threshold.value || threshold.value <= 0))
          "
          severity="error"
          variant="simple"
          size="small"
        >
          {{ valueError || "Value must be a positive number." }}
        </Message>
      </div>

      <div class="field">
        <label for="periodType" class="font-bold block mb-2">Period Type</label>
        <Select
          id="periodType"
          v-model="threshold.periodType"
          :options="options.periods"
          placeholder="Select Period"
          :disabled="isPeriodDisabled"
          :invalid="
            !!periodError ||
            (submitted && !isPeriodDisabled && !threshold.periodType)
          "
          aria-describedby="period-error"
          fluid
          @change="clearError"
        />
        <Message
          id="period-error"
          v-if="
            periodError ||
            (submitted && !isPeriodDisabled && !threshold.periodType)
          "
          severity="error"
          variant="simple"
          size="small"
        >
          {{ periodError || "Period is required for this type." }}
        </Message>
      </div>

      <div class="field">
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
      <Button
        label="Cancel"
        icon="pi pi-times"
        text
        type="button"
        @click="emit('cancel')"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        type="submit"
        form="threshold-form"
        :loading="loading"
        :disabled="loading"
      />
    </template>
  </Dialog>
</template>
