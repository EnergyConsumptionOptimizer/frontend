<script setup>
import { inject, computed } from "vue";

const props = defineProps({
  zone: {
    type: Object,
    required: true,
  },
  editModeActive: Boolean,
});
const interactiveMap = inject("interactiveMap");

const emit = defineEmits(["zoneClick", "zoneVerticeClick"]);

const pointsToPath = (points) => {
  if (points.length === 0) return "";
  return `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")} Z`;
};

const zoneClick = (event, zone, pointID = null) => {
  if (!props.editModeActive) return;

  event.stopPropagation();
  const position = interactiveMap.getSvgPoint(event);

  if (pointID != null) {
    emit("zoneVerticeClick", zone, pointID, position);
    return;
  }

  emit("zoneClick", zone, position);
};

const truncatedName = computed(() => {
  const name = props.zone.name;
  if (!name) return "";
  return name.length > 25 ? name.substring(0, 25) + "..." : name;
});

const descId = `zone-desc-${props.zone.id}`;
</script>

<template>
  <g
    :aria-labelledby="`${descId}`"
    @mousedown="props.editModeActive ? zoneClick($event, props.zone) : null"
    :class="{ 'cursor-move': props.editModeActive }"
  >
    <desc :id="descId"> Zone : {{ props.zone.name }} </desc>
    <path
      :d="pointsToPath(props.zone.points)"
      :fill="props.zone.color"
      fill-opacity="0.4"
      :stroke="props.zone.color"
      stroke-width="2"
    />

    <g v-if="props.editModeActive">
      <circle
        v-for="(point, i) in props.zone.points"
        :key="i"
        :cx="point.x"
        :cy="point.y"
        r="16"
        :fill="props.zone.color"
        stroke="white"
        stroke-width="3"
        style="cursor: pointer"
        @mousedown="zoneClick($event, props.zone, i)"
      />
    </g>

    <text
      :x="
        props.zone.points.reduce((sum, p) => sum + p.x, 0) /
        props.zone.points.length
      "
      :y="
        props.zone.points.reduce((sum, p) => sum + p.y, 0) /
        props.zone.points.length
      "
      text-anchor="middle"
      fill="#000"
      font-size="38"
      font-weight="bold"
      pointer-events="none"
    >
      {{ truncatedName }}
    </text>
  </g>
</template>

<style scoped></style>
