<script setup>
import InteractiveMap from "@/components/interactiveMap/InteractiveMap.vue";
</script>

<template>
  <div class="flex flex-col h-full gap-4">
    <div class="shrink-0">
      <h1 class="text-2xl sm:text-3xl font-bold m-0">Map editor</h1>
    </div>

    <Card class="flex-1 min-h-0 flex flex-col">
      <template #content>
        <div class="h-full min-h-0">
          <InteractiveMap />
        </div>
      </template>
    </Card>
  </div>
</template>
