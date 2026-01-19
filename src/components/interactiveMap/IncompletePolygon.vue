<script setup>
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
</script>

<template>
  <g>
    <polyline
      :points="props.polygonPath"
      fill="none"
      :stroke="props.color"
      stroke-width="12"
      stroke-dasharray="20"
    />
    <circle
      v-for="(point, i) in props.points"
      :key="i"
      :cx="point.x"
      :cy="point.y"
      r="16"
      :fill="props.color"
    />
  </g>
</template>

<style scoped></style>
