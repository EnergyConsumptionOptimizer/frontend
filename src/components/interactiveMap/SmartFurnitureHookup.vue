<script setup>
import { computed, inject } from "vue";
import { utilityType } from "@/utils/utilityType.js";
import { MAP_CONSTANTS } from "@/config/uiConstants";
import ElectricityIcon from "@/components/interactiveMap/ElectricityIcon.vue";
import GasIcon from "@/components/interactiveMap/GasIcon.vue";
import WaterIcon from "@/components/interactiveMap/WaterIcon.vue";

const interactiveMap = inject("interactiveMap");
const props = defineProps({
  smartFurnitureHookup: {
    type: Object,
    required: true,
  },
  editModeActive: Boolean,
  scaleFactor: {
    type: Number,
    required: true,
  },
});
const emit = defineEmits(["smartFurnitureHookupClick"]);

const smartFurnitureRadius = computed(
  () => MAP_CONSTANTS.SMART_FURNITURE_RADIUS * props.scaleFactor * 0.5,
);
const iconScale = computed(() => 3 * props.scaleFactor * 0.5);

const smartFurnitureHookupClick = (event, hookup = null) => {
  if (!props.editModeActive) return;

  event.stopPropagation();
  const p = interactiveMap.getSvgPoint(event);

  emit("smartFurnitureHookupClick", hookup, p);
};

const color = computed(() => {
  return props.smartFurnitureHookup.active ? "#137937" : "#F5F5F5";
});

const strokeColor = computed(() => {
  return props.smartFurnitureHookup.active ? "#0c5225" : "#546E7A";
});

const statusLabel = computed(() => {
  return props.smartFurnitureHookup.active ? "Active" : "Inactive";
});

const transform = computed(() => {
  return "translate(-12, -12)";
});

const title = computed(() => {
  const name = props.smartFurnitureHookup.name;
  const consumption = props.smartFurnitureHookup.utilityConsumption;
  const status = statusLabel.value;

  if (!consumption) {
    return `${name} (${status})`;
  }

  return `${name} (${status}) - Consumption: ${consumption}`;
});

const desc = computed(() => {
  const { name, utilityType, utilityConsumption, zone } =
    props.smartFurnitureHookup;
  const consumption = utilityConsumption ?? 0;
  const inZone = zone ? "Yes" : "No";
  const status = statusLabel.value;

  return `${name}, ${status}, type ${utilityType}, consumption ${consumption}. Located in a zone: ${inZone}. ${props.editModeActive ? "Click and drag to move." : ""}`;
});

const titleId = `hookup-title-${props.smartFurnitureHookup.id}`;
const descId = `hookup-desc-${props.smartFurnitureHookup.id}`;
</script>

<template>
  <g
    role="graphics-object"
    :aria-labelledby="`${titleId} ${descId}`"
    data-testid="hookup-marker"
    :data-hookup-name="props.smartFurnitureHookup.name"
    @mousedown="
      props.editModeActive
        ? smartFurnitureHookupClick($event, props.smartFurnitureHookup)
        : null
    "
    :class="{ 'cursor-move': props.editModeActive }"
    :transform="`translate(${props.smartFurnitureHookup.position.x}, ${props.smartFurnitureHookup.position.y})`"
  >
    <title :id="titleId">
      {{ title }}
    </title>
    <desc :id="descId">
      {{ desc }}
    </desc>

    <g :transform="`scale(${iconScale})`">
      <electricity-icon
        v-if="
          props.smartFurnitureHookup.utilityType === utilityType.ELECTRICITY
        "
        :fill="color"
        :stroke="strokeColor"
        :transform="transform"
        aria-hidden="true"
      />
      <gas-icon
        v-else-if="props.smartFurnitureHookup.utilityType === utilityType.GAS"
        :fill="color"
        :stroke="strokeColor"
        :transform="transform"
        aria-hidden="true"
      />
      <water-icon
        v-else-if="props.smartFurnitureHookup.utilityType === utilityType.WATER"
        :fill="color"
        :stroke="strokeColor"
        :transform="transform"
        aria-hidden="true"
      />
      <circle
        v-else
        :r="smartFurnitureRadius"
        :fill="color"
        :stroke="strokeColor"
        aria-hidden="true"
      />
    </g>
  </g>
</template>
