<script setup></script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div class="grid grid-cols-1 xl:grid-cols-10 gap-4 w-full">
      <!-- Map Editor Area - Full width on mobile, 70% on xl -->
      <section
        class="xl:col-span-7 flex flex-col min-h-0 order-1"
        aria-label="Map editor"
      >
        <div class="mb-4">
          <slot name="actions" />
        </div>

        <div
          class="w-full relative bg-surface-50 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden flex items-center justify-center"
          style="min-height: 400px; height: 60vh"
          role="application"
          aria-label="Floor plan canvas"
        >
          <slot name="floor-plan" />
        </div>
      </section>

      <aside
        class="xl:col-span-3 min-h-0 order-2"
        style="min-height: 300px"
        aria-label="Zone and hookup management"
      >
        <div class="h-full">
          <slot name="sidebar" />
        </div>
      </aside>
    </div>
  </div>
</template>
