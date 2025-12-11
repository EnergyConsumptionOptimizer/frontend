<script setup>
import { ref, reactive, watch, computed, onMounted } from "vue";
import { useLayout } from "@/layout/composables/layout";

defineOptions({ name: "ChartHistorical" });

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
      },
    ],
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
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold m-0">Historical Consumptions</h3>
      <i
        v-if="props.loading"
        class="pi pi-spin pi-spinner text-primary text-xl"
      />
    </div>

    <div class="flex flex-col gap-4 mb-6">
      <div class="flex flex-wrap gap-3 justify-between items-center">
        <SelectButton
          v-model="filters.utility"
          :options="props.utilities"
          :allow-empty="false"
          @change="notifyChange"
        />
        <div class="flex gap-2">
          <Dropdown
            v-model="filters.granularity"
            :options="props.granularities"
            optionLabel="label"
            class="w-36"
            @change="notifyChange"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <Dropdown
          v-model="filters.user"
          :options="props.users"
          optionLabel="label"
          class="w-32"
          @change="notifyChange"
        />
        <Dropdown
          v-model="filters.zone"
          :options="props.zones"
          optionLabel="label"
          class="w-32"
          @change="notifyChange"
        />
      </div>
    </div>

    <div class="flex-1 w-full min-h-64 relative">
      <Chart
        type="bar"
        :data="chartDataComputed"
        :options="chartOptions"
        class="h-full w-full"
        :class="{ 'opacity-50': props.loading }"
      />
    </div>
  </div>
</template>
