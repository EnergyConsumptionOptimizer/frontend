<script setup>
defineOptions({
  name: "StatCard",
});

defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "#3B82F6",
    validator(value) {
      return value.startsWith("#") || value.startsWith("var(--");
    },
  },
});
</script>

<template>
  <div class="card">
    <header class="flex justify-between items-start">
      <h3 class="text-gray-500 dark:text-gray-300 font-medium text-sm">
        {{ label }}
      </h3>

      <div
        class="flex items-center justify-center rounded-xl w-10 h-10"
        :style="{ color: color }"
      >
        <slot name="icon">
          <i v-if="icon" :class="icon"></i>
        </slot>
      </div>
    </header>

    <div class="mt-2">
      <p class="flex items-baseline space-x-1">
        <data
          :value="value"
          class="text-gray-900 dark:text-white font-bold text-3xl tracking-tight"
        >
          {{ value }}
        </data>
        <span class="text-gray-400 dark:text-gray-500 font-medium text-sm">
          {{ unit }}
        </span>
      </p>
    </div>
  </div>
</template>
