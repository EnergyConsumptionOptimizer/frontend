<script setup>
import { ref, reactive, watch, computed, onMounted } from "vue";
import { useLayout } from "@/layout/composables/useLayout";

defineOptions({ name: "ConsumptionHistoryChart" });

const props = defineProps({
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  utilities: { type: Array, default: () => ["Option"] },
  granularities: {
    type: Array,
    default: () => [{ label: "Granularity", value: "g" }],
  },
  users: { type: Array, default: () => [{ label: "User", value: "u" }] },
  zones: { type: Array, default: () => [{ label: "Zone", value: "z" }] },
});

const emit = defineEmits(["filter-change"]);

const { isDarkTheme } = useLayout();
const chartOptions = ref();

const filters = reactive({
  utility: props.utilities[0],
  granularity: props.granularities[0],
  user: props.users[0],
  zone: props.zones[0],
});

const notifyChange = () => {
  if (filters.user?.value !== props.users[0]?.value)
    filters.zone = props.zones[0];
  if (filters.zone?.value !== props.zones[0]?.value)
    filters.user = props.users[0];
  emit("filter-change", { ...filters });
};

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
          autoSkip: false,
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
  const utilName =
    typeof filters.utility === "string"
      ? filters.utility
      : filters.utility?.label || "Default";
  const colorName = `--p-${utilName.toLowerCase()}-500`;

  return {
    labels: props.labels,
    datasets: [
      {
        label: utilName,
        data: props.values,
        fill: true,
        borderColor: getColor(colorName),
        backgroundColor: getColor(colorName, 0.5),
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

watch(isDarkTheme, updateChartOptions);

onMounted(() => {
  updateChartOptions();
  notifyChange();
});
</script>

<template>
  <div class="card h-full flex flex-col">
    <div class="flex flex-col gap-4 mb-4 shrink-0">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold m-0">Historical Consumptions</h3>
        <i
          v-if="props.loading"
          class="pi pi-spin pi-spinner text-primary text-xl"
        />
      </div>

      <div
        class="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center"
      >
        <SelectButton
          v-model="filters.utility"
          :options="props.utilities"
          :allow-empty="false"
          @change="notifyChange"
          class="w-full md:w-auto responsive-select-button"
        />

        <Dropdown
          v-model="filters.granularity"
          :options="props.granularities"
          optionLabel="label"
          class="w-full md:w-40"
          @change="notifyChange"
        />
      </div>

      <div class="flex gap-2">
        <Dropdown
          v-model="filters.user"
          :options="props.users"
          optionLabel="label"
          class="w-1/2"
          @change="notifyChange"
        />
        <Dropdown
          v-model="filters.zone"
          :options="props.zones"
          optionLabel="label"
          class="w-1/2"
          @change="notifyChange"
        />
      </div>
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
            :class="{ 'opacity-50': props.loading }"
          />
        </div>
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
