<script setup>
import { computed } from "vue";
import ConsumptionChartToolBar from "@/components/charts/ConsumptionChartToolBar.vue";
import { useChartTheme } from "@/composables/charts/useChartTheme";
import { useChartFilters } from "@/composables/charts/useChartFilters";
import { useChartScroll } from "@/composables/charts/useChartScroll";

defineOptions({ name: "ConsumptionHistoryChart" });

const props = defineProps({
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  utilities: { type: Array, default: () => [] },
  granularities: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  zones: { type: Array, default: () => [] },
});

const emit = defineEmits(["filter-change"]);

const { getDynamicColor, baseOptions } = useChartTheme();
const { filters, handleFilterChange } = useChartFilters(props, emit);
const containerStyle = useChartScroll(computed(() => props.values.length));

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
  plugins: { ...baseOptions.value.plugins, legend: { display: false } },
  elements: { bar: { borderRadius: 4 } },
}));
</script>

<template>
  <div class="card h-full flex flex-col">
    <ConsumptionChartToolBar
      title="Historical Consumptions"
      v-model:filters="filters"
      :loading="loading"
      :utilities="utilities"
      :granularities="granularities"
      :users="users"
      :zones="zones"
      @change="handleFilterChange"
    />

    <div class="flex-1 min-h-0 w-full relative">
      <div
        class="h-full w-full overflow-x-auto overflow-y-hidden custom-scrollbar"
      >
        <div :style="containerStyle">
          <Chart
            type="bar"
            :data="chartData"
            :options="chartOptions"
            class="h-full w-full"
            :class="{ 'opacity-50': loading }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
