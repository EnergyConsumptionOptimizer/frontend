<script setup>
import { computed } from "vue";

defineOptions({
  name: "StatCard",
});

const props = defineProps({
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
    default: "#FFFFFF",
    validator(value) {
      return (
        value.startsWith("#") ||
        value.startsWith("var(--") ||
        value.startsWith("--")
      );
    },
  },
});

const computedColor = computed(() => {
  if (props.color.startsWith("--") && !props.color.startsWith("var(")) {
    return `var(${props.color})`;
  }
  return props.color;
});
</script>

<template>
  <article class="card" role="region" :aria-label="`${label} statistics`">
    <header class="flex justify-between items-start">
      <h3
        class="text-xs sm:text-sm text-surface-600 dark:text-surface-300 font-medium m-0"
      >
        {{ label }}
      </h3>

      <div
        class="flex items-center justify-center rounded-xl w-10 h-10"
        :style="{ color: computedColor }"
        aria-hidden="true"
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
          class="text-2xl sm:text-3xl text-surface-900 dark:text-surface-50 font-bold tracking-tight select-all"
        >
          {{ value }}
        </data>
        <span
          class="text-sm text-surface-500 dark:text-surface-400 font-medium select-all"
        >
          {{ unit }}
        </span>
      </p>
    </div>
  </article>
</template>
