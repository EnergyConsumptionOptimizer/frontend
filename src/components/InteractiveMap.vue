<script setup>
import {computed, ref} from "vue";
import {getSvgViewBox} from '@/utils/getSvgViewBox'


const props = defineProps({
  floorPlanSvg: {
    type: String
  }
});

const svgRef = ref(null);

const svgContent = computed(() => props.floorPlanSvg || "");
const viewBox = computed(() => getSvgViewBox(svgContent.value));

const extractedSvg = computed(() => {
  if (!props.floorPlanSvg) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(props.floorPlanSvg, "image/svg+xml");
  const svgEl = doc.querySelector("svg");

  if (!svgEl) return props.floorPlanSvg;

  const innerViewBox = svgEl.getAttribute('viewBox');
  const outerViewBox = viewBox.value;

  if (innerViewBox && outerViewBox) {
    const [, , innerW, innerH] = innerViewBox.split(' ').map(Number);
    const [, , outerW, outerH] = outerViewBox.split(' ').map(Number);

    const scaleX = outerW / innerW;
    const scaleY = outerH / innerH;
    const scale = Math.min(scaleX, scaleY);

    const innerContent = Array.from(svgEl.children)
        .map(child => child.outerHTML)
        .join('');

    return `<g transform="scale(${scale})">${innerContent}</g>`;
  }

  return Array.from(svgEl.children)
      .map(child => child.outerHTML)
      .join('');
});
</script>

<template>
  <svg
      ref="svgRef"
      :viewBox="viewBox"
      preserveAspectRatio="xMidYMid meet"
      class="h-full w-full"
  >
    <g>
      <g v-html="extractedSvg" />
    </g>
  </svg>
</template>