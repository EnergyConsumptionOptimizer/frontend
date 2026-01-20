<script setup>
import { inject, computed } from "vue";
import { TEXT_LIMITS } from "@/config/uiConstants";

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
  return name.length > TEXT_LIMITS.ZONE_NAME_MAX_LENGTH
    ? name.substring(0, TEXT_LIMITS.ZONE_NAME_MAX_LENGTH) +
        TEXT_LIMITS.ZONE_NAME_TRUNCATION_SUFFIX
    : name;
});

const titleId = `zone-title-${props.zone.id}`;
const descId = `zone-desc-${props.zone.id}`;
</script>

<template>
  <g
    role="graphics-object"
    :aria-labelledby="`${titleId} ${descId}`"
    @mousedown="props.editModeActive ? zoneClick($event, props.zone) : null"
    :class="{ 'cursor-move': props.editModeActive }"
  >
    <title :id="titleId">Zone: {{ props.zone.name }}</title>
    <desc :id="descId">
      Zone {{ props.zone.name }} with {{ props.zone.points.length }} vertices.
      {{
        props.editModeActive
          ? "Click to move zone, click vertices to adjust shape."
          : ""
      }}
    </desc>

    <path
      :d="pointsToPath(props.zone.points)"
      :fill="props.zone.color"
      :fill-opacity="MAP_CONSTANTS.ZONE_FILL_OPACITY"
      :stroke="props.zone.color"
      :stroke-width="MAP_CONSTANTS.ZONE_STROKE_WIDTH"
    />

    <g v-if="props.editModeActive" role="list" aria-label="Zone vertices">
      <circle
        v-for="(point, i) in props.zone.points"
        :key="i"
        role="button"
        :aria-label="`Vertex ${i + 1} of ${props.zone.points.length}`"
        :cx="point.x"
        :cy="point.y"
        :r="MAP_CONSTANTS.VERTEX_RADIUS"
        :fill="props.zone.color"
        stroke="white"
        stroke-width="4"
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
      aria-hidden="true"
    >
      {{ truncatedName }}
    </text>
  </g>
</template>
