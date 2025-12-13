import { computed } from "vue";
import { useLayout } from "@/layout/composables/useLayout";
import { DOMAIN_COLORS, DISTRIBUTION_PALETTE } from "@/config/chartPalette";

export function useChartTheme() {
  const { isDarkTheme } = useLayout();

  const resolveCssVar = (varName) => {
    if (typeof window === "undefined" || !varName) return "#888888";
    if (varName.startsWith("#") || varName.startsWith("rgb")) return varName;

    const cleanName = varName.replace(/^var\((.+)\)$/, "$1").trim();
    const styles = getComputedStyle(document.documentElement);
    const value = styles.getPropertyValue(cleanName).trim();

    return value || varName;
  };

  const hexToRgba = (colorRef, alpha = 1) => {
    const hex = resolveCssVar(colorRef);

    if (!hex || !hex.startsWith("#")) return `rgba(100, 116, 139, ${alpha})`;

    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getDynamicColor = (input, alpha = 1) => {
    const rawLabel =
      typeof input === "string" ? input : input?.label || "default";
    const key = rawLabel.toLowerCase();
    const colorVar = DOMAIN_COLORS[key] || DOMAIN_COLORS.default;

    return hexToRgba(colorVar, alpha);
  };

  const generatePalette = (count) => {
    return Array.from({ length: count }).map((_, i) =>
      hexToRgba(DISTRIBUTION_PALETTE[i % DISTRIBUTION_PALETTE.length]),
    );
  };

  const baseOptions = computed(() => {
    const isDark = isDarkTheme.value;
    const textColor = isDark ? "#e2e8f0" : "#334155";
    const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

    return {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: { labels: { color: textColor, usePointStyle: true } },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { display: false },
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor, borderDash: [5, 5] },
          beginAtZero: true,
        },
      },
    };
  });

  return { getDynamicColor, generatePalette, baseOptions };
}
