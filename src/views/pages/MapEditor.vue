<script setup>
import InteractiveMap from "@/components/interactiveMap/InteractiveMap.vue";
</script>

<template>
  <div class="flex flex-col gap-4 h-full">
    <div>
      <h1 class="text-3xl font-bold m-0">Map editor</h1>
    </div>

    <Card class="flex-1">
      <template #content>
        <interactive-map />
      </template>
    </Card>
  </div>
</template>

<style scoped></style>
