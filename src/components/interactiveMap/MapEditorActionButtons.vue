<script setup>
defineProps({
  isViewMode: Boolean,
  isDrawMode: Boolean,
  isEditMode: Boolean,
});
</script>

<template>
  <div class="flex w-full">
    <Toolbar class="w-full">
      <template #start>
        <div class="flex items-center gap-2 flex-wrap">
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
