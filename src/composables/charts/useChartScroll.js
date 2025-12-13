import { computed } from "vue";

export function useChartScroll(dataLength, pxPerItem = 30, threshold = 20) {
  return computed(() => {
    const count = dataLength.value || 0;
    const width = count > threshold ? `${count * pxPerItem}px` : "100%";
    return {
      width,
      height: "100%",
      position: "relative",
    };
  });
}
