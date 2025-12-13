<script setup>
import { computed } from "vue";
import ConsumptionChartToolBar from "@/components/charts/ConsumptionChartToolBar.vue";
import { useChartTheme } from "@/composables/charts/useChartTheme";
import { useChartFilters } from "@/composables/charts/useChartFilters";

defineOptions({ name: "ConsumptionRealTimeChart" });

const props = defineProps({
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  utilities: { type: Array, default: () => [] },
  timeRanges: { type: Array, default: () => [] },
  granularities: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  zones: { type: Array, default: () => [] },
});

const emit = defineEmits(["filter-change"]);

const { getDynamicColor, baseOptions } = useChartTheme();
const { filters, handleFilterChange } = useChartFilters(props, emit);

const chartData = computed(() => {
  const selected = filters.utility || props.utilities?.[0];
  const utilName =
    typeof selected === "string" ? selected : selected?.label || "default";

  return {
    labels: props.labels,
    datasets: [
      {
        label: utilName,
        data: props.values,
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
  plugins: { ...baseOptions.value.plugins, legend: { display: false } },
}));
</script>

<template>
  <div class="card h-full flex flex-col">
    <ConsumptionChartToolBar
      title="Real-Time Consumptions"
      v-model:filters="filters"
      :loading="loading"
      :utilities="utilities"
      :time-ranges="timeRanges"
      :granularities="granularities"
      :users="users"
      :zones="zones"
      @change="handleFilterChange"
    />

    <div class="flex-1 w-full min-h-64 relative">
      <Chart
        type="line"
        :data="chartData"
        :options="chartOptions"
        class="h-full w-full"
        :class="{ 'opacity-50': loading }"
      />
    </div>
  </div>
</template>
