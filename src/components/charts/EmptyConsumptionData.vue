<script setup lang="ts"></script>

<template>
  <div
    class="absolute inset-0 flex flex-col items-center justify-center text-surface-500 dark:text-surface-400 select-none"
    role="status"
    aria-live="polite"
  >
    <span class="pi pi-chart-bar text-4xl mb-3" aria-hidden="true"></span>
    <h3
      class="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-2"
    >
      No Data Available
    </h3>
    <p class="text-sm text-surface-600 dark:text-surface-400">
      Try changing the selected filters or time range.
    </p>
  </div>
</template>

<style scoped></style>
