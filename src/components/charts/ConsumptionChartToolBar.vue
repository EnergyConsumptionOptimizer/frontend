<script setup>
defineOptions({ name: "ConsumptionChartToolBar" });

defineProps({
  utilities: { type: Array, default: () => [] },
  timeRanges: { type: Array, default: () => [] },
  granularities: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  zones: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  title: { type: String, default: "" },
});

const filters = defineModel("filters", { type: Object, required: true });
const emit = defineEmits(["change"]);

const handleChange = (key) => {
  emit("change", key);
};
</script>

<template>
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-xl font-semibold m-0">{{ title }}</h3>
    <i v-if="loading" class="pi pi-spin pi-spinner text-primary text-xl" />
  </div>

  <div class="flex flex-col gap-4 mb-6">
    <div class="flex flex-wrap gap-3 justify-between items-center">
      <SelectButton
        v-if="utilities.length"
        v-model="filters.utility"
        :options="utilities"
        :allow-empty="false"
        class="w-full sm:w-auto"
        @change="handleChange('utility')"
      />

      <div class="flex gap-2 w-full sm:w-auto">
        <Select
          v-if="timeRanges.length"
          v-model="filters.time"
          :options="timeRanges"
          optionLabel="label"
          class="w-1/2 sm:w-32"
          @change="handleChange('time')"
        />
        <Select
          v-if="granularities.length"
          v-model="filters.granularity"
          :options="granularities"
          optionLabel="label"
          class="w-1/2 sm:w-36"
          @change="handleChange('granularity')"
        />
      </div>
    </div>

    <div v-if="users.length || zones.length" class="flex gap-2">
      <Select
        v-if="users.length"
        v-model="filters.user"
        :options="users"
        optionLabel="label"
        class="w-1/2 sm:w-32"
        placeholder="User"
        @change="handleChange('user')"
      />
      <Select
        v-if="zones.length"
        v-model="filters.zone"
        :options="zones"
        optionLabel="label"
        class="w-1/2 sm:w-32"
        placeholder="Zone"
        @change="handleChange('zone')"
      />
    </div>
  </div>
</template>
