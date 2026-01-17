<script setup>
defineProps({
  color: { type: String, required: true },
  indicatorClass: { type: String },
  label: { type: String, required: true },
});
</script>

<template>
  <div class="flex items-center justify-between w-full min-w-0 gap-2">
    <div class="flex items-center gap-2 min-w-0 flex-1">
      <div
        class="h-4 w-4 shrink-0"
        :class="indicatorClass"
        :style="{ backgroundColor: color }"
      />

      <span
        class="truncate text-sm font-medium text-surface-700 dark:text-surface-0 block"
        v-tooltip.top="label"
      >
        {{ label }}
      </span>
    </div>

    <div v-if="$slots.actions" class="flex items-center gap-1 shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
