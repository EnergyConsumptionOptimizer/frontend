<script setup>
import InteractiveMap from "@/components/interactiveMap/InteractiveMap.vue";
import { onUnmounted } from "vue";

onUnmounted(async () => {
  console.log("View unmounting, closing sockets...");
  const { useMonitoringStore } = await import("@/stores/monitoringStore.js");
  const monitoringStore = useMonitoringStore();
  monitoringStore.disconnectMonitoring();
});
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
