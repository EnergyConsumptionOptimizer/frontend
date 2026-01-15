<script setup lang="ts">
defineProps({
  isViewMode: Boolean,
  isDrawMode: Boolean,
  isEditMode: Boolean,
});
</script>

<template>
  <div class="hidden md:flex w-full">
    <Toolbar class="w-full">
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
  </div>
</template>

<style scoped></style>
