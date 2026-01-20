<script setup>
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
  <div
    class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6"
  >
    <div class="flex items-center gap-2 w-full sm:w-auto">
      <h3
        :id="title.toLowerCase().replace(/\s+/g, '-') + '-title'"
        class="text-lg sm:text-xl font-semibold m-0"
      >
        {{ title }}
      </h3>
      <i
        v-if="loading"
        class="pi pi-spin pi-spinner text-primary text-lg sm:text-xl"
        aria-hidden="true"
      ></i>
      <span v-if="loading" class="sr-only">Loading chart data...</span>
    </div>
  </div>

  <div class="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
    <div
      class="flex flex-col sm:flex-row flex-wrap gap-3 justify-between items-stretch sm:items-center"
    >
      <SelectButton
        v-if="utilities.length"
        v-model="filters.utility"
        :options="utilities"
        :allow-empty="false"
        class="w-full sm:w-auto"
        :disabled="loading"
        @change="handleChange('utility')"
        aria-label="Select utility type"
        :pt="{
          button: {
            class: 'min-h-11',
          },
        }"
      />
      <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <div v-if="timeRanges.length" class="flex items-center gap-2">
          <label
            for="time-range-select"
            class="text-sm text-surface-600 dark:text-surface-400"
            >Time</label
          >
          <Select
            id="time-range-select"
            v-model="filters.time"
            :options="timeRanges"
            optionLabel="label"
            optionValue="value"
            class="w-full sm:w-32 min-h-11"
            :disabled="loading"
            @change="handleChange('time')"
            aria-label="Select time range"
            :pt="{
              root: {
                class: 'min-h-11',
              },
            }"
          />
        </div>
        <div v-if="granularities.length" class="flex items-center gap-2">
          <label
            for="granularity-select"
            class="text-sm text-surface-600 dark:text-surface-400"
            >Granularity</label
          >
          <Select
            id="granularity-select"
            v-model="filters.granularity"
            :options="granularities"
            optionLabel="label"
            class="w-full sm:w-36 min-h-11"
            :disabled="loading"
            @change="handleChange('granularity')"
            aria-label="Select data granularity"
            :pt="{
              root: {
                class: 'min-h-11',
              },
            }"
          />
        </div>
      </div>
    </div>

    <div
      v-if="users.length || zones.length"
      class="flex flex-col sm:flex-row gap-2"
    >
      <Select
        v-if="users.length"
        id="user-filter-select"
        v-model="filters.user"
        :options="users"
        optionLabel="label"
        class="w-full sm:w-32 min-h-11"
        placeholder="User"
        :disabled="loading"
        @change="handleChange('user')"
        aria-label="Filter by user"
        :pt="{
          root: {
            class: 'min-h-11',
          },
        }"
      />
      <Select
        v-if="zones.length"
        id="zone-filter-select"
        v-model="filters.zone"
        :options="zones"
        optionLabel="label"
        class="w-full sm:w-32 min-h-11"
        placeholder="Zone"
        :disabled="loading"
        @change="handleChange('zone')"
        aria-label="Filter by zone"
        :pt="{
          root: {
            class: 'min-h-11',
          },
        }"
      />
    </div>
  </div>
</template>
