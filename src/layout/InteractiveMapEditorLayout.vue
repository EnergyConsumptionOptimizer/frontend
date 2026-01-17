<script setup></script>

<template>
  <div class="w-full flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
    <div class="grid grid-cols-1 xl:grid-cols-10 gap-4 w-full h-full">
      <div
        class="col-span-1 xl:col-span-7 flex flex-col h-full min-h-0 overflow-hidden order-1"
      >
        <div class="mb-2 shrink-0">
          <slot name="actions" />
        </div>

        <div
          class="flex-1 w-full relative bg-surface-50 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden flex items-center justify-center"
        >
          <slot name="floor-plan" />
        </div>
      </div>

      <div class="col-span-1 xl:col-span-3 h-full min-h-0 min-w-0 order-2">
        <slot name="sidebar" />
      </div>
    </div>
  </div>
</template>
