<script setup>
defineProps({
  title: String,
  subtitle: String,
});
</script>

<template>
  <div class="flex flex-col justify-center items-center w-full space-y-2">
    <div class="font-semibold text-xl mb-4">{{ title }}</div>
    <p>{{ subtitle }}</p>
  </div>

  <div class="flex justify-center flex-1 mt-4">
    <slot name="content" />
  </div>

  <slot name="dialogs" />
</template>

<style></style>
