<script setup>
import { ref, computed } from "vue";
import { useChartTheme } from "@/composables/charts/useChartTheme";
import { useChartScroll } from "@/composables/charts/useChartScroll";

defineOptions({ name: "ConsumptionForecastChart" });

const props = defineProps({
  title: { type: String, required: true },
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  periods: { type: Array, default: () => [{ label: "Daily", value: "daily" }] },
});

const emit = defineEmits(["period-change"]);

const { getDynamicColor, baseOptions } = useChartTheme();

const containerStyle = useChartScroll(computed(() => props.values.length));

const selectedPeriod = ref(props.periods[0]);

const chartData = computed(() => {
  const baseColor = getDynamicColor(props.title, 0.5);
  const borderColor = getDynamicColor(props.title, 1);
  return {
    labels: props.labels,
    datasets: [
      {
        label: props.title,
        data: props.values,
        backgroundColor: baseColor,
        borderColor: borderColor,
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
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 shrink-0 gap-3"
    >
      <h3 class="text-lg font-semibold m-0">{{ title }}</h3>
      <SelectButton
        v-model="selectedPeriod"
        :options="periods"
        optionLabel="label"
        :allow-empty="false"
        @change="emit('period-change', selectedPeriod)"
        class="w-full sm:w-auto responsive-select-button"
      />
    </div>

    <div class="flex-1 min-h-0 w-full relative">
      <div
        class="h-full w-full overflow-x-auto overflow-y-hidden custom-scrollbar"
      >
        <div :style="containerStyle">
          <Chart
            type="bar"
            :data="chartData"
            :options="chartOptions"
            class="h-full w-full transition-opacity"
            :class="{ 'opacity-50': loading }"
          />
        </div>
      </div>
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 z-10"
      >
        <i class="pi pi-spin pi-spinner text-primary text-2xl" />
      </div>
    </div>
  </div>
</template>
