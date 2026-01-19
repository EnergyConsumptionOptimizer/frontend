<script setup>
import { computed } from "vue";
import ConsumptionChartToolBar from "@/components/charts/ConsumptionChartToolBar.vue";
import { useChartTheme } from "@/composables/charts/useChartTheme";
import { useChartFilters } from "@/composables/charts/useChartFilters";

const props = defineProps({
  timeFilterConfig: { type: Object, default: () => {} },
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

const timeOptions = computed(() => {
  return Object.entries(props.timeFilterConfig).map(([key, val]) => ({
    label: val.label,
    value: key,
  }));
});

const computedGranularities = computed(() => {
  if (!filters.time) return [];
  return props.timeFilterConfig[filters.time]?.granularities || [];
});

const chartData = computed(() => {
  const selected = filters.utility || props.utilities?.[0];
  const utilName =
    typeof selected === "string" ? selected : selected?.label || "default";

  return {
    labels: props.consumptionSeries.utilityConsumptionPoints?.map((point) => {
      return point.timestamp;
    }),
    datasets: [
      {
        unit: props.consumptionSeries.utilityConsumptionUnit,
        data: props.consumptionSeries.utilityConsumptionPoints?.map((point) => {
          return point.value;
        }),
        fill: true,
        borderColor: getDynamicColor(utilName, 1),
        backgroundColor: getDynamicColor(utilName, 0.1),
        tension: 0.4,
        pointRadius: 2,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  ...baseOptions.value,
  animation: { duration: 0 },
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
}));

const hasData = computed(() => {
  const points = props.consumptionSeries?.utilityConsumptionPoints;
  return Array.isArray(points) && points.length > 0;
});
</script>

<template>
  <div class="card h-full flex flex-col">
    <ConsumptionChartToolBar
      title="Real-Time Consumptions"
      v-model:filters="filters"
      :utilities="utilities"
      :time-ranges="timeOptions"
      :granularities="computedGranularities"
      :users="users"
      :zones="zones"
      :loading="loading"
      @change="handleFilterChange"
    />

    <div class="flex-1 w-full min-h-64 relative">
      <div
        v-if="!hasData"
        class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 select-none"
      >
        <span class="pi pi-chart-bar" style="font-size: 2rem"></span>
        <h3 class="text-lg font-medium">No Data Available</h3>
        <p class="text-sm">Try changing the selected filters or time range.</p>
      </div>
      <Chart
        v-else
        type="line"
        :data="chartData"
        :options="chartOptions"
        class="h-full w-full"
        :class="{ 'opacity-50': loading }"
      />
    </div>
  </div>
</template>
