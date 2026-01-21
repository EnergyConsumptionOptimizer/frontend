<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useThresholdStore } from "@/stores/thresholdStore";
import { useUniqueFieldValidation } from "@/composables/common/useUniqueFieldValidation.js";
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
const { getFieldError: getServerError, globalError } =
  useServerFormErrors(error);

const submitted = ref(false);

const nameRef = computed(() => threshold.value?.name);
const idRef = computed(() => threshold.value?.id);

const { validationError: localNameError, isValid: isNameUnique } =
  useUniqueFieldValidation(nameRef, thresholds, idRef, "name");

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
    if (thresholdStore.error) thresholdStore.clearError();
  }
});

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
    header="Threshold Details"
    modal
    class="w-full max-w-lg mx-4"
    @hide="emit('cancel')"
  >
    <form
      id="threshold-form"
      @submit.prevent="onSave"
      class="flex flex-col gap-6"
      novalidate
      aria-label="Threshold configuration form"
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
        <label for="name" class="font-semibold text-base">
          Name <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <InputText
          id="name"
          v-model.trim="threshold.name"
          required
          autofocus
          class="w-full min-h-11"
          :invalid="!!nameError || (submitted && !threshold.name)"
          :aria-invalid="!!nameError || (submitted && !threshold.name)"
          aria-describedby="name-error"
          fluid
          aria-required="true"
          placeholder="Enter threshold name"
          @input="clearError"
        />
        <Message
          id="name-error"
          v-if="nameError || (submitted && !threshold.name)"
          severity="error"
          variant="simple"
          size="small"
          role="alert"
          aria-live="polite"
        >
          {{ nameError || "Name is required." }}
        </Message>
      </div>

      <div class="flex flex-col gap-2">
        <label for="utility" class="font-semibold text-base">
          Utility <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <Select
          id="utility"
          v-model="threshold.utilityType"
          :options="options.utilities"
          placeholder="Select utility type"
          class="w-full"
          pt:pcInput:root:class="min-h-11"
          :invalid="!!utilityError || (submitted && !threshold.utilityType)"
          :aria-invalid="
            !!utilityError || (submitted && !threshold.utilityType)
          "
          aria-describedby="utility-error"
          fluid
          aria-required="true"
          @change="clearError"
        />
        <Message
          id="utility-error"
          v-if="utilityError || (submitted && !threshold.utilityType)"
          severity="error"
          variant="simple"
          size="small"
          role="alert"
          aria-live="polite"
        >
          {{ utilityError || "Utility is required." }}
        </Message>
      </div>

      <div class="flex flex-col gap-2">
        <label for="type" class="font-semibold text-base">
          Threshold Type <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <Select
          id="type"
          v-model="threshold.thresholdType"
          :options="options.types"
          placeholder="Select threshold type"
          class="w-full"
          pt:pcInput:root:class="min-h-11"
          :invalid="!!typeError || (submitted && !threshold.thresholdType)"
          :aria-invalid="!!typeError || (submitted && !threshold.thresholdType)"
          aria-describedby="type-error"
          fluid
          aria-required="true"
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
          role="alert"
          aria-live="polite"
        >
          {{ typeError || "Type is required." }}
        </Message>
      </div>

      <div class="flex flex-col gap-2">
        <label for="value" class="font-semibold text-base">
          Value <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <InputNumber
          id="value"
          v-model="threshold.value"
          :min="Number.EPSILON"
          :minFractionDigits="0"
          :maxFractionDigits="6"
          class="w-full"
          pt:pcInput:root:class="min-h-11"
          :invalid="
            !!valueError ||
            (submitted && (!threshold.value || threshold.value <= 0))
          "
          :aria-invalid="
            !!valueError ||
            (submitted && (!threshold.value || threshold.value <= 0))
          "
          aria-describedby="value-error"
          fluid
          aria-required="true"
          placeholder="Enter threshold value"
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
          role="alert"
          aria-live="polite"
        >
          {{ valueError || "Value must be a positive number." }}
        </Message>
      </div>

      <div class="flex flex-col gap-2">
        <label for="periodType" class="font-semibold text-base">
          Period Type
          <span v-if="!isPeriodDisabled" class="text-red-500" aria-hidden="true"
            >*</span
          >
        </label>
        <Select
          id="periodType"
          v-model="threshold.periodType"
          :options="options.periods"
          placeholder="Select period type"
          :disabled="isPeriodDisabled"
          class="w-full"
          pt:pcInput:root:class="min-h-11"
          :invalid="
            !!periodError ||
            (submitted && !isPeriodDisabled && !threshold.periodType)
          "
          :aria-invalid="
            !!periodError ||
            (submitted && !isPeriodDisabled && !threshold.periodType)
          "
          aria-describedby="period-error"
          fluid
          :aria-required="!isPeriodDisabled"
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

      <div class="flex flex-col gap-2">
        <label for="status" class="font-semibold text-base">State</label>
        <Select
          id="status"
          v-model="threshold.thresholdState"
          :options="statusOptions"
          placeholder="Select State"
          fluid
          class="w-full"
          aria-label="Threshold state"
        />
      </div>
    </form>

    <template #footer>
      <div class="flex flex-col sm:flex-row justify-end gap-3">
        <Button
          label="Cancel"
          icon="pi pi-times"
          text
          type="button"
          class="min-h-11 w-full sm:w-auto"
          aria-label="Cancel threshold editing"
          @click="emit('cancel')"
        />
        <Button
          label="Save"
          icon="pi pi-check"
          type="submit"
          form="threshold-form"
          class="min-h-11 w-full sm:w-auto"
          :loading="loading"
          :disabled="loading"
          :aria-label="
            threshold?.id ? 'Save threshold changes' : 'Create new threshold'
          "
        />
      </div>
    </template>
  </Dialog>
</template>
