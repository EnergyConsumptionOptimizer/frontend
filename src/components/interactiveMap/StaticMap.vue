<script setup>
import SmartFurnitureHookup from "@/components/interactiveMap/SmartFurnitureHookup.vue";
import Zone from "@/components/interactiveMap/Zone.vue";
import InteractiveMapLayout from "@/layout/InteractiveMapLayout.vue";
import { onBeforeMount, onBeforeUnmount, onUnmounted } from "vue";
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";
import { useMonitoringStore } from "@/stores/monitoringStore.js";
import { storeToRefs } from "pinia";

const interactiveMapStore = useInteractiveMapStore();
const monitoringStore = useMonitoringStore();

const { zones, svgData, realTimeSmartFurnitureHookups } =
  storeToRefs(interactiveMapStore);

onBeforeMount(() => {
  interactiveMapStore.viewMap();
  monitoringStore.subscribeToActiveSmartFurnitureHookups();
});

onBeforeUnmount(() => {
  monitoringStore.unsubscribeFromActiveSmartFurnitureHookups();
});
onUnmounted(() => {
  monitoringStore.disconnectMonitoring();
});
</script>

<template>
  <interactive-map-layout :floor-plan-svg="svgData">
    <template #zones="{ scaleFactor }">
      <zone
        v-for="zone in zones"
        :key="zone.id"
        :editModeActive="false"
        :zone="zone"
        :scale-factor="scaleFactor"
      />
    </template>

    <template #hookups="{ scaleFactor }">
      <smart-furniture-hookup
        v-for="sfh in realTimeSmartFurnitureHookups"
        :key="sfh.id"
        :editModeActive="false"
        :smartFurnitureHookup="sfh"
        :scale-factor="scaleFactor"
      />
    </template>
  </interactive-map-layout>
</template>
