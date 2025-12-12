<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useLayout } from "@/layout/composables/useLayout";

defineOptions({ name: "ConsumptionForecastChart" });

const props = defineProps({
  title: { type: String, required: true },
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  periods: {
    type: Array,
    default: () => [
      { label: "Daily", value: "daily" },
      { label: "Weekly", value: "weekly" },
      { label: "Monthly", value: "monthly" },
    ],
  },
});

const emit = defineEmits(["period-change"]);

const { isDarkTheme } = useLayout();
const chartOptions = ref({});
const selectedPeriod = ref(props.periods[0]);

const getColor = (name, alpha = 1) => {
  if (typeof window === "undefined") return `rgba(0,0,0,${alpha})`;
  const style = getComputedStyle(document.documentElement);
  const hex =
    style.getPropertyValue(name).trim() ||
    style.getPropertyValue("--p-primary-500").trim();
  const [r, g, b] = hex.match(/\w\w/g)?.map((x) => parseInt(x, 16)) || [
    0, 0, 0,
  ];
  return `rgba(${r},${g},${b},${alpha})`;
};

const updateChartOptions = () => {
  const style = getComputedStyle(document.documentElement);
  const textColorSec = style.getPropertyValue("--text-color-secondary");
  const surfaceBorder = style.getPropertyValue("--surface-border");

  chartOptions.value = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        ticks: {
          color: textColorSec,
          maxRotation: 0,
          autoSkip: true,
        },
        grid: { display: false },
      },
      y: {
        ticks: { color: textColorSec },
        grid: { color: surfaceBorder, borderDash: [5, 5] },
        beginAtZero: true,
      },
    },
    elements: {
      bar: { borderRadius: 4 },
    },
  };
};

const chartDataComputed = computed(() => {
  const colorVar = `--p-${props.title.toLowerCase()}-500`;
  const baseColor = getColor(colorVar, 0.5);
  const borderColor = getColor(colorVar, 1);

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

const chartStyle = computed(() => {
  const itemCount = props.values.length;
  const PX_PER_ITEM = 30;
  const SCROLL_THRESHOLD = 20;

  const width =
    itemCount > SCROLL_THRESHOLD ? `${itemCount * PX_PER_ITEM}px` : "100%";

  return {
    width: width,
    height: "100%",
    position: "relative",
  };
});

const onPeriodChange = () => {
  emit("period-change", selectedPeriod.value);
};

watch(isDarkTheme, updateChartOptions);

onMounted(() => {
  updateChartOptions();
});
</script>

<template>
  <div class="card h-full flex flex-col">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 shrink-0 gap-3 sm:gap-0"
    >
      <h3 class="text-lg font-semibold m-0">{{ title }}</h3>

      <SelectButton
        v-model="selectedPeriod"
        :options="periods"
        optionLabel="label"
        :allow-empty="false"
        @change="onPeriodChange"
        class="w-full sm:w-auto responsive-select-button"
      />
    </div>

    <div class="flex-1 min-h-0 w-full relative">
      <div
        class="h-full w-full overflow-x-auto overflow-y-hidden custom-scrollbar"
      >
        <div :style="chartStyle">
          <Chart
            type="bar"
            :data="chartDataComputed"
            :options="chartOptions"
            class="h-full w-full"
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--surface-300);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: var(--surface-400);
}
:deep(.responsive-select-button) {
  display: flex;
}
:deep(.responsive-select-button .p-button) {
  flex: 1;
  justify-content: center;
  padding: 0.5rem;
  font-size: 0.85rem;
}
@media (min-width: 768px) {
  :deep(.responsive-select-button .p-button) {
    flex: initial;
    padding: 0.5rem 1rem;
  }
}
</style>
