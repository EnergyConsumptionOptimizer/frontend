<script setup>
import InteractiveMap from "@/components/interactiveMap/InteractiveMap.vue";
</script>

<template>
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12">
      <h1 class="text-3xl font-bold mb-2">Map editor</h1>
    </div>
  </div>
  <Card>
    <template #content>
      <interactive-map />
    </template>
  </Card>
</template>

<style scoped></style>
