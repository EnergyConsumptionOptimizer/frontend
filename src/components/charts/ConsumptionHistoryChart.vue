<script setup>
import { computed } from "vue";
import ConsumptionChartToolBar from "@/components/charts/ConsumptionChartToolBar.vue";
import { useChartTheme } from "@/composables/charts/useChartTheme";
import { useChartFilters } from "@/composables/charts/useChartFilters";
import { useChartScroll } from "@/composables/charts/useChartScroll";
import EmptyConsumptionData from "@/components/charts/EmptyConsumptionData.vue";

const props = defineProps({
  timeFilterConfig: {
    type: Object,
    default: () => {},
  },
  utilities: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  zones: { type: Array, default: () => [] },
  consumptionSeries: {
    type: Object,
    default: () => {},
  },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["filter-change"]);

const { getDynamicColor, baseOptions } = useChartTheme();
const { filters, handleFilterChange } = useChartFilters(props, emit);

const containerStyle = useChartScroll(
  computed(() => props.consumptionSeries?.utilityConsumptionPoints?.length | 0),
);

const timeOptions = computed(() => {
  return Object.entries(props.timeFilterConfig).map(([key, val]) => ({
    label: val.label,
    value: key,
  }));
});

const hasData = computed(() => {
  const points = props.consumptionSeries?.utilityConsumptionPoints;

  if (!Array.isArray(points) || points.length === 0) return false;

  return points.some((point) => point.value > 0);
});

const chartData = computed(() => {
  const selected = filters.utility || props.utilities?.[0];
  const utilName =
    typeof selected === "string" ? selected : selected?.label || "default";

  return {
    labels: props.consumptionSeries.utilityConsumptionPoints?.map((point) => {
      const date = point.timestamp.split(",");

      return filters.time === "1day" ? date[1] : date[0];
    }),
    datasets: [
      {
        unit: props.consumptionSeries.utilityConsumptionUnit,
        data: props.consumptionSeries.utilityConsumptionPoints?.map((point) => {
          return point.value;
        }),
        fill: true,
        borderColor: getDynamicColor(utilName, 1),
        backgroundColor: getDynamicColor(utilName, 0.5),
        borderWidth: 1,
        barPercentage: 0.8,
        categoryPercentage: 0.9,
        maxBarThickness: 60,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  ...baseOptions.value,
  plugins: {
    ...baseOptions.value.plugins,
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw.toFixed(2);
          const unit = context.dataset.unit || "";
          return `${value} ${unit}`;
        },
      },
    },
  },
  animation: false,
  elements: { bar: { borderRadius: 4 } },
}));
</script>

<template>
  <section
    class="card h-full flex flex-col"
    aria-labelledby="historical-consumptions-title"
  >
    <ConsumptionChartToolBar
      title="Historical Consumptions"
      v-model:filters="filters"
      :utilities="utilities"
      :time-ranges="timeOptions"
      :users="users"
      :zones="zones"
      :loading="loading"
      @change="handleFilterChange"
    />

    <div
      class="flex-1 w-full relative"
      style="min-height: 16rem"
      role="region"
      aria-live="polite"
      aria-atomic="true"
    >
      <empty-consumption-data v-if="!hasData" />
      <div
        v-else
        class="h-full w-full overflow-x-auto overflow-y-hidden custom-scrollbar"
      >
        <div :style="containerStyle">
          <Chart
            type="bar"
            :data="chartData"
            :options="chartOptions"
            class="h-full w-full transition-opacity"
            :class="{ 'opacity-50': loading }"
            role="img"
            :aria-label="`Historical ${filters.utility || 'consumption'} chart`"
          />
        </div>
      </div>
    </div>
  </section>
</template>
