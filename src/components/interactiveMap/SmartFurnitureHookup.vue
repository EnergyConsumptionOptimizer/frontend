<script setup>
import {computed} from "vue";
import {inject} from 'vue';
import {utilityType} from "@/utils/utilityType.js";
import ElectricityIcon from "@/components/interactiveMap/ElectricityIcon.vue";
import GasIcon from "@/components/interactiveMap/GasIcon.vue";
import WaterIcon from "@/components/interactiveMap/WaterIcon.vue";

const interactiveMap = inject('interactiveMap');
const props = defineProps({
  smartFurnitureHookup: {
    type: Object,
    required: true
  },
  editModeActive: Boolean,
})
const emit = defineEmits(['smartFurnitureHookupClick'])

const smartFurnitureHookupClick = (event, hookup = null) => {
  if (!props.editModeActive) return;

  event.stopPropagation();
  const p = interactiveMap.getSvgPoint(event);

  emit('smartFurnitureHookupClick', hookup, p);
}

const color = computed(() => {
  return props.smartFurnitureHookup.consumptionValue > 0 ? "#008000" : "#808080";
})

const transform = computed(() => {
  return "translate(-12, -12)"
})

</script>

<template>
  <g
      @mousedown="props.editModeActive ? smartFurnitureHookupClick($event, props.smartFurnitureHookup) : null"
      :class="{'cursor-move': props.editModeActive}"
      :transform="`translate(${props.smartFurnitureHookup.position.x}, ${props.smartFurnitureHookup.position.y})`">
    <g :transform="`scale(2)`">
      <electricity-icon
          v-if="props.smartFurnitureHookup.utilityType === utilityType.ELECTRICITY"
          :fill="color" :transform="transform"/>
      <gas-icon v-else-if="props.smartFurnitureHookup.utilityType === utilityType.GAS"
                :fill="color" :transform="transform"/>
      <water-icon v-else-if="props.smartFurnitureHookup.utilityType === utilityType.WATER"
                  :fill="color" :transform="transform"/>
      <circle v-else
              r="8"
              :fill="color"
      />
    </g>
  </g>
</template>
