<script setup lang="ts">
defineProps({
  isViewMode: Boolean,
  isDrawMode: Boolean,
  isEditMode: Boolean,
})
</script>

<template>
  <div class="flex justify-start border rounded-lg p-4 w-full space-x-3">
    <template v-if="isViewMode">
      <slot name="viewActions" />
    </template>

    <template v-if="isDrawMode">
      <slot name="drawActions" />
    </template>

    <template v-if="isEditMode">
      <slot name="editActions" />
    </template>
  </div>
</template>

<style scoped>

</style>