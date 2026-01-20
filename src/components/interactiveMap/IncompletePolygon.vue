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
  scaleFactor: {
    type: Number,
    required: true,
  },
});

const vertexRadius = computed(
  () => POLYGON_CONSTANTS.INCOMPLETE_VERTEX_RADIUS * props.scaleFactor,
);
const strokeWidth = computed(() => 6 * props.scaleFactor);
const vertexStrokeWidth = computed(() => 2 * props.scaleFactor);
const dashArray = computed(() => 16 * props.scaleFactor);

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
      :stroke-width="strokeWidth"
      :stroke-dasharray="dashArray"
      aria-hidden="true"
    />
    <circle
      v-for="(point, i) in props.points"
      :key="i"
      :cx="point.x"
      :cy="point.y"
      :r="vertexRadius"
      :fill="props.color"
      stroke="white"
      :stroke-width="vertexStrokeWidth"
      :aria-label="`Point ${i + 1} of ${props.points.length}`"
    />
  </g>
</template>
