<script setup>
import { computed } from "vue";

const props = defineProps({
  visible: { type: Boolean, required: true },
  submitted: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  options: {
    type: Object,
    default: () => ({ utilities: [], types: [], periods: [] }),
  },
  isPeriodDisabled: { type: Boolean, default: false },
  statusOptions: { type: Array, default: () => [] },
});

const threshold = defineModel("threshold", { required: true });

const emit = defineEmits(["update:visible", "save", "cancel", "type-change"]);

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    :style="{ width: '450px' }"
    header="Threshold Details"
    modal
    class="p-fluid"
  >
    <form
      id="thresholdForm"
      @submit.prevent="$emit('save')"
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
          aria-describedby="name-error"
          fluid
        />
        <small
          v-if="submitted && !threshold.name"
          id="name-error"
          class="text-red-500"
        >
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
          aria-describedby="utility-error"
          fluid
        />
        <small
          v-if="submitted && !threshold.utilityType"
          id="utility-error"
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
          aria-describedby="type-error"
          fluid
          @change="$emit('type-change')"
        />
        <small
          v-if="submitted && !threshold.thresholdType"
          id="type-error"
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
          aria-describedby="value-error"
          fluid
        />
        <small
          v-if="submitted && (!threshold.value || threshold.value <= 0)"
          id="value-error"
          class="text-red-500"
        >
          Value must be a positive number.
        </small>
      </div>

      <div>
        <label for="periodType" class="font-bold block mb-2">Period Type</label>
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
      <Button label="Cancel" icon="pi pi-times" text @click="$emit('cancel')" />
      <Button
        label="Save"
        icon="pi pi-check"
        type="submit"
        form="thresholdForm"
        :loading="loading"
      />
    </template>
  </Dialog>
</template>
