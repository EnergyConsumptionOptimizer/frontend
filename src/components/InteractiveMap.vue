<script setup>
import { computed, ref } from "vue";
import { getSvgViewBox } from "@/utils/getSvgViewBox";
import { provide } from "vue";

const props = defineProps({
  floorPlanSvg: {
    type: String,
  },
  cursor: String,
});

const emit = defineEmits(["interactiveMapClick", "interactiveMapMouseMove"]);

const svgRef = ref(null);

const svgContent = computed(() => props.floorPlanSvg || "");
const viewBox = computed(() => getSvgViewBox(svgContent.value));

const extractedSvg = computed(() => {
  if (!props.floorPlanSvg) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(props.floorPlanSvg, "image/svg+xml");
  const svgEl = doc.querySelector("svg");

  if (!svgEl) return props.floorPlanSvg;

  const innerViewBox = svgEl.getAttribute("viewBox");
  const outerViewBox = viewBox.value;

  if (innerViewBox && outerViewBox) {
    const [, , innerW, innerH] = innerViewBox.split(" ").map(Number);
    const [, , outerW, outerH] = outerViewBox.split(" ").map(Number);

    const scaleX = outerW / innerW;
    const scaleY = outerH / innerH;
    const scale = Math.min(scaleX, scaleY);

    const innerContent = Array.from(svgEl.children)
      .map((child) => child.outerHTML)
      .join("");

    return `<g transform="scale(${scale})">${innerContent}</g>`;
  }

  return Array.from(svgEl.children)
    .map((child) => child.outerHTML)
    .join("");
});

const getSvgPoint = (event) => {
  if (!svgRef.value) return null;

  const svg = svgRef.value;
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

  return { x: svgP.x, y: svgP.y };
};

const svgClick = (event) => {
  if (!svgRef.value) return null;
  const point = getSvgPoint(event);
  emit("interactiveMapClick", point);
};

const svgMouseMove = (event) => {
  if (!svgRef.value) return null;
  const point = getSvgPoint(event);
  emit("interactiveMapMouseMove", point);
};

provide("interactiveMap", {
  getSvgPoint,
  svgRef,
});
</script>

<template>
  <svg
    ref="svgRef"
    :viewBox="viewBox"
    preserveAspectRatio="xMidYMid meet"
    class="h-full w-full"
    @click="svgClick"
    @mousemove="svgMouseMove"
    :class="cursor"
  >
    <g>
      <g v-html="extractedSvg" />
      <g>
        <slot name="zones" />
      </g>
      <g>
        <slot name="hookups" />
      </g>
      <slot></slot>
    </g>
  </svg>
</template>
