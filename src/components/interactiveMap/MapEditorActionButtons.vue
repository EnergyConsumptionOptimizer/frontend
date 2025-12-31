<script setup lang="ts">
defineProps({
  isViewMode: Boolean,
  isDrawMode: Boolean,
  isEditMode: Boolean,
});
</script>

<template>
  <Toolbar class="mb-6 w-full">
    <template #start>
      <div class="flex items-center gap-2">
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
  </Toolbar>
</template>

<style scoped></style>
