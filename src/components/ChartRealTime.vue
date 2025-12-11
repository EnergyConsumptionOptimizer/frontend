<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from "vue";
import { useLayout } from "@/layout/composables/layout";
import { ConsumptionService } from "@/service/MockConsumptionService";

defineOptions({ name: "ChartRealTime" });

const UTILITIES = ["Electricity", "Gas", "Water"];
const TIME_RANGES = [
  { label: "1 Day", value: "1d" },
  { label: "5 Days", value: "5d" },
  { label: "1 Month", value: "1mo" },
  { label: "All", value: "all" },
];
const GRANULARITIES = [
  { label: "5 Min", value: "5m" },
  { label: "1 Hour", value: "1h" },
  { label: "1 Day", value: "1d" },
];
const USERS = [{ label: "All Users", value: "all" }];
const ZONES = [{ label: "Zone A", value: "a" }];
const UPDATE_INTERVAL = 2000;

const { isDarkTheme } = useLayout();
const isLoading = ref(false);
const chartData = ref();
const chartOptions = ref();
let timer = null;

const filters = reactive({
  utility: "Electricity",
  time: TIME_RANGES[0],
  granularity: GRANULARITIES[0],
  user: USERS[0],
  zone: ZONES[0],
});

const getColor = (name, alpha = 1) => {
  const style = getComputedStyle(document.documentElement);
  const hex =
    style.getPropertyValue(name).trim() ||
    style.getPropertyValue("--p-primary-500").trim();
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
};

const updateChartOptions = () => {
  const style = getComputedStyle(document.documentElement);
  const textColorSec = style.getPropertyValue("--text-color-secondary");

  chartOptions.value = {
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { ticks: { color: textColorSec }, grid: { display: false } },
      y: {
        ticks: { color: textColorSec },
        grid: { color: style.getPropertyValue("--surface-border") },
        beginAtZero: true,
      },
    },
  };
};

const tick = async () => {
  if (!chartData.value) return;

  const dataset = chartData.value.datasets[0];
  const lastVal = dataset.data[dataset.data.length - 1];

  const point = await ConsumptionService.getNextValue(lastVal, filters.utility);

  const newLabels = [...chartData.value.labels.slice(1), point.label];
  const newValues = [...dataset.data.slice(1), point.value];

  chartData.value = {
    ...chartData.value,
    labels: newLabels,
    datasets: [{ ...dataset, data: newValues }],
  };
};

const initData = async () => {
  clearInterval(timer);
  isLoading.value = true;
  updateChartOptions();

  try {
    const res = await ConsumptionService.getConsumptions(filters);
    const colorName = `--p-${filters.utility.toLowerCase()}-500`;

    chartData.value = {
      labels: res.labels,
      datasets: [
        {
          data: res.values,
          fill: true,
          borderColor: getColor(colorName),
          backgroundColor: getColor(colorName, 0.1),
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    };

    timer = setInterval(tick, UPDATE_INTERVAL);
  } finally {
    isLoading.value = false;
  }
};

watch([filters, isDarkTheme], initData, { deep: true });

onMounted(initData);
onUnmounted(() => clearInterval(timer));
</script>

<template>
  <div class="card h-full flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold m-0">Real-Time Consumptions</h3>
      <i v-if="isLoading" class="pi pi-spin pi-spinner text-primary text-xl" />
    </div>

    <div class="flex flex-col gap-4 mb-6">
      <div class="flex flex-wrap gap-3 justify-between items-center">
        <SelectButton
          v-model="filters.utility"
          :options="UTILITIES"
          :disabled="isLoading"
          :allow-empty="false"
        />
        <div class="flex gap-2">
          <Dropdown
            v-model="filters.time"
            :options="TIME_RANGES"
            optionLabel="label"
            class="w-32"
            :disabled="isLoading"
          />
          <Dropdown
            v-model="filters.granularity"
            :options="GRANULARITIES"
            optionLabel="label"
            class="w-36"
            :disabled="isLoading"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <Dropdown
          v-model="filters.user"
          :options="USERS"
          optionLabel="label"
          class="w-32"
          :disabled="isLoading"
        />
        <Dropdown
          v-model="filters.zone"
          :options="ZONES"
          optionLabel="label"
          class="w-32"
          :disabled="isLoading"
        />
      </div>
    </div>

    <div class="flex-1 w-full min-h-64 relative">
      <Chart
        type="line"
        :data="chartData"
        :options="chartOptions"
        class="h-full w-full"
        :class="{ 'opacity-50': isLoading }"
      />
    </div>
  </div>
</template>
