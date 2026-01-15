<script setup>
import SmartFurnitureHookup from "@/components/interactiveMap/SmartFurnitureHookup.vue";
import Zone from "@/components/interactiveMap/Zone.vue";
import InteractiveMapLayout from "@/layout/InteractiveMapLayout.vue";

defineProps({
  floorPlanSvg: { type: String },
  zones: { type: Array, default: () => [] },
  smartFurnitureHookups: { type: Array, default: () => [] },
});
</script>

<template>
  <interactive-map-layout :floor-plan-svg="floorPlanSvg">
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
        v-for="sfh in smartFurnitureHookups"
        :key="sfh.id"
        :editModeActive="false"
        :smartFurnitureHookup="sfh"
      />
    </template>
  </interactive-map-layout>
</template>

<style scoped></style>
