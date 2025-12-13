<script setup>
import { computed } from "vue";
import ConsumptionChartToolBar from "@/components/charts/ConsumptionChartToolBar.vue";
import { useChartTheme } from "@/composables/charts/useChartTheme";
import { useChartFilters } from "@/composables/charts/useChartFilters";

defineOptions({ name: "ConsumptionDistributionChart" });

const props = defineProps({
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  utilities: { type: Array, default: () => [] },
  timeRanges: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  zones: { type: Array, default: () => [] },
});

const emit = defineEmits(["filter-change"]);

const { generatePalette, baseOptions } = useChartTheme();
const { filters, handleFilterChange } = useChartFilters(props, emit);

const chartData = computed(() => {
  const bgColors = generatePalette(props.values.length);

  return {
    labels: props.labels,
    datasets: [
      {
        data: props.values,
        backgroundColor: bgColors,
        borderColor: bgColors,
        borderWidth: 1,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  ...baseOptions.value,
  plugins: {
    ...baseOptions.value.plugins,
    legend: {
      ...baseOptions.value.plugins.legend,
      position: "bottom",
    },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
}));
</script>

<template>
  <div class="card h-full flex flex-col">
    <ConsumptionChartToolBar
      title="Filtered Consumptions"
      v-model:filters="filters"
      :loading="loading"
      :utilities="utilities"
      :time-ranges="timeRanges"
      :users="users"
      :zones="zones"
      @change="handleFilterChange"
    />

    <div
      class="flex-1 w-full min-h-64 relative flex justify-center items-center"
    >
      <Chart
        type="doughnut"
        :data="chartData"
        :options="chartOptions"
        class="h-full w-full max-w-md transition-opacity"
        :class="{ 'opacity-50 pointer-events-none': loading }"
      />
    </div>
  </div>
</template>
