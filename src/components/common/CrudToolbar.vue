<script setup>
defineProps({
  selectedItems: {
    type: Array,
    default: () => [],
  },
  disableDelete: {
    type: Boolean,
    default: false,
  },
  createLabel: {
    type: String,
    default: "New",
  },
  createIcon: {
    type: String,
    default: "pi pi-plus",
  },
  deleteLabel: {
    type: String,
    default: "Delete",
  },
  deleteIcon: {
    type: String,
    default: "pi pi-trash",
  },
  deleteSeverity: {
    type: String,
    default: "danger",
  },
  showCreate: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["create", "delete-selected"]);
</script>

<template>
  <Toolbar class="mb-4 sm:mb-6">
    <template #start>
      <div class="flex flex-wrap gap-2">
        <Button
          v-if="showCreate"
          :label="createLabel"
          :icon="createIcon"
          :severity="createLabel === 'New' ? 'success' : undefined"
          class="min-h-11"
          @click="emit('create')"
          :aria-label="createLabel === 'New' ? 'Create new item' : createLabel"
        />
        <Button
          :label="deleteLabel"
          :icon="deleteIcon"
          :severity="deleteSeverity"
          :outlined="disableDelete || !selectedItems || !selectedItems.length"
          class="min-h-11"
          @click="emit('delete-selected')"
          :disabled="disableDelete || !selectedItems || !selectedItems.length"
          :aria-label="
            selectedItems?.length
              ? `${deleteLabel} ${selectedItems.length} selected items`
              : `${deleteLabel} selected items`
          "
        />
        <slot name="extra-actions"></slot>
      </div>
    </template>
  </Toolbar>
</template>
