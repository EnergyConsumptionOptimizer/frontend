<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4"
  >
    <div class="w-full max-w-md">
      <div
        class="bg-gradient-to-b from-primary-400 to-primary-500 p-1 rounded-3xl sm:rounded-[56px]"
      >
        <div
          class="bg-surface-0 dark:bg-surface-900 rounded-3xl sm:rounded-[53px] p-6 sm:p-8 md:p-12"
        >
          <header class="text-center mb-6 sm:mb-8">
            <h1
              class="text-2xl sm:text-3xl font-medium text-surface-900 dark:text-surface-0 mb-2"
            >
              {{ title }}
            </h1>
            <p
              v-if="subtitle"
              class="text-sm sm:text-base text-surface-600 dark:text-surface-400"
            >
              {{ subtitle }}
            </p>
          </header>

          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>
