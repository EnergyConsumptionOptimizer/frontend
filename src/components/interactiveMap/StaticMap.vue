<script setup>
import SmartFurnitureHookup from "@/components/interactiveMap/SmartFurnitureHookup.vue";
import Zone from "@/components/interactiveMap/Zone.vue";
import InteractiveMapLayout from "@/layout/InteractiveMapLayout.vue";
import { onBeforeMount, onMounted } from "vue";
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";
import { useMonitoringStore } from "@/stores/monitoringStore.js";
import { storeToRefs } from "pinia";

const interactiveMapStore = useInteractiveMapStore();
const monitoringStore = useMonitoringStore();

const { zones, svgData, realTimeSmartFurnitureHookups } =
  storeToRefs(interactiveMapStore);

onBeforeMount(() => {
  interactiveMapStore.viewMap();
});

onMounted(() => {
  interactiveMapStore.setLocalMode(false);
  monitoringStore.subscribeToActiveSmartFurnitureHookups();
});
</script>

<template>
  <interactive-map-layout :floor-plan-svg="svgData">
    <template #zones>
      <zone
        v-for="zone in zones"
        :key="zone.id"
        :editModeActive="false"
        :zone="zone"
      />
    </template>

    <template #hookups>
      <smart-furniture-hookup
        v-for="sfh in realTimeSmartFurnitureHookups"
        :key="sfh.id"
        :editModeActive="false"
        :smartFurnitureHookup="sfh"
      />
    </template>
  </interactive-map-layout>
</template>

<style scoped></style>
