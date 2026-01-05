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
    class="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-900 p-4"
  >
    <div class="w-full max-w-md">
      <div
        class="bg-linear-to-b from-primary-400 to-primary-400 p-1 rounded-[56px]"
      >
        <div
          class="bg-surface-0 dark:bg-surface-900 rounded-[53px] p-8 sm:p-12"
        >
          <div class="text-center mb-8">
            <h1
              class="text-3xl font-medium text-surface-900 dark:text-surface-0 mb-2"
            >
              {{ title }}
            </h1>
            <p v-if="subtitle" class="text-muted-color">{{ subtitle }}</p>
          </div>

          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-password .p-icon) {
  transform: scale(1.2);
  margin-right: 0.5rem;
}
</style>
