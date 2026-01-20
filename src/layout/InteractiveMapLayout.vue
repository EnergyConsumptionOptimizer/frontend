<script setup>
import { computed, ref } from "vue";
import { getSvgViewBox } from "@/utils/getSvgViewBox";
import { provide } from "vue";

const props = defineProps({
  floorPlanSvg: {
    type: String,
    default: "",
  },
  cursor: {
    type: String,
    default: "cursor-default",
  },
});

const emit = defineEmits(["interactiveMapClick", "interactiveMapMouseMove"]);

const svgRef = ref(null);

const svgContent = computed(() => props.floorPlanSvg || "");
const viewBox = computed(() => getSvgViewBox(svgContent.value));

const elementScaleFactor = computed(() => {
  const vb = viewBox.value;
  if (!vb) return 1;

  const [, , width, height] = vb.split(" ").map(Number);
  const maxDimension = Math.max(width, height);

  return Math.max(1, maxDimension / 1000);
});

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
    :class="cursor"
    role="img"
    aria-label="Interactive floor plan map"
    @click="svgClick"
    @mousemove="svgMouseMove"
  >
    <title>Floor Plan</title>
    <desc>Interactive map showing zones and smart furniture hookups</desc>

    <g>
      <g v-html="extractedSvg" aria-hidden="true" />

      <g role="list" aria-label="Zones">
        <slot name="zones" :scale-factor="elementScaleFactor" />
      </g>

      <g role="list" aria-label="Smart furniture hookups">
        <slot name="hookups" :scale-factor="elementScaleFactor" />
      </g>

      <slot></slot>
    </g>
  </svg>
</template>
