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
});

const emit = defineEmits(["create", "delete-selected"]);
</script>

<template>
  <Toolbar class="mb-6">
    <template #start>
      <Button
        label="New"
        icon="pi pi-plus"
        severity="secondary"
        class="mr-2"
        @click="emit('create')"
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        severity="secondary"
        @click="emit('delete-selected')"
        :disabled="disableDelete || !selectedItems || !selectedItems.length"
      />
    </template>
  </Toolbar>
</template>
