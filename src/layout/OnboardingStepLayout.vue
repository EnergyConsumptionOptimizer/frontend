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
  <div class="flex flex-col w-full space-y-4 sm:space-y-6">
    <header class="text-center">
      <h2 class="text-xl sm:text-2xl font-semibold mb-2">
        {{ title }}
      </h2>
      <p
        v-if="subtitle"
        class="text-sm sm:text-base text-surface-600 dark:text-surface-300"
      >
        {{ subtitle }}
      </p>
    </header>

    <div class="flex-1">
      <slot name="content" />
    </div>

    <slot name="dialogs" />
  </div>
</template>
