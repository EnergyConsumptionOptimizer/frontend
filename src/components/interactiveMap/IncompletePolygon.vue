<script setup>
import { computed } from "vue";
import { POLYGON_CONSTANTS } from "@/config/uiConstants";

const props = defineProps({
  polygonPath: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  points: {
    type: Array,
    required: true,
  },
});

const ariaLabel = computed(
  () =>
    `Drawing zone in progress. ${props.points.length} point${props.points.length !== 1 ? "s" : ""} placed. Click to add more points or close the polygon.`,
);
</script>

<template>
  <g role="graphics-object" :aria-label="ariaLabel">
    <polyline
      :points="props.polygonPath"
      fill="none"
      :stroke="props.color"
      stroke-width="6"
      stroke-dasharray="16"
      aria-hidden="true"
    />
    <circle
      v-for="(point, i) in props.points"
      :key="i"
      :cx="point.x"
      :cy="point.y"
      :r="POLYGON_CONSTANTS.INCOMPLETE_VERTEX_RADIUS"
      :fill="props.color"
      stroke="white"
      stroke-width="2"
      :aria-label="`Point ${i + 1} of ${props.points.length}`"
    />
  </g>
</template>
