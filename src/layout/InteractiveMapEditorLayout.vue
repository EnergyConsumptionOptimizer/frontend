<script setup></script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 min-h-0">
      <section
        class="xl:col-span-9 flex flex-col min-h-0 order-1"
        aria-label="Map editor"
      >
        <div class="mb-4">
          <slot name="actions" />
        </div>

        <div
          class="w-full h-full relative bg-surface-50 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden flex items-center justify-center min-h-[400px]"
          role="application"
          aria-label="Floor plan canvas"
        >
          <slot name="floor-plan" />
        </div>
      </section>

      <aside
        class="xl:col-span-3 min-h-0 order-2 flex flex-col"
        style="min-height: 300px"
        aria-label="Zone and hookup management"
      >
        <div class="h-full flex flex-col">
          <slot name="sidebar" />
        </div>
      </aside>
    </div>
  </div>
</template>
