<script setup>
import { ref, reactive, watch, computed, onMounted } from "vue";
import { useLayout } from "@/layout/composables/layout";

defineOptions({ name: "ChartFiltered" });

const props = defineProps({
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  utilities: { type: Array, default: () => ["Option"] },
  timeRanges: {
    type: Array,
    default: () => [{ label: "Time", value: "Time" }],
  },
  users: { type: Array, default: () => [{ label: "User", value: "User" }] },
  zones: { type: Array, default: () => [{ label: "Zone", value: "Zone" }] },
});

const emit = defineEmits(["filter-change"]);

const PALETTE = [
  "--p-primary-500",
  "--p-green-500",
  "--p-yellow-500",
  "--p-red-500",
  "--p-cyan-500",
  "--p-purple-500",
  "--p-gray-500",
];

const { isDarkTheme } = useLayout();
const chartOptions = ref();

const filters = reactive({
  utility: props.utilities[0],
  time: props.timeRanges[0],
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

const getPaletteColors = (count) => {
  if (typeof window === "undefined") return [];
  const style = getComputedStyle(document.documentElement);
  return Array.from({ length: count }).map((_, i) => {
    const varName = PALETTE[i % PALETTE.length];
    const hex = style.getPropertyValue(varName).trim() || "#cccccc";
    const [r, g, b] = hex.match(/\w\w/g)?.map((x) => parseInt(x, 16)) || [
      0, 0, 0,
    ];
    return `rgba(${r},${g},${b}, 1)`;
  });
};

const updateChartOptions = () => {
  const style = getComputedStyle(document.documentElement);
  const textColor = style.getPropertyValue("--text-color");

  chartOptions.value = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: textColor, usePointStyle: true },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.raw || 0;
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct =
              total > 0 ? ((val / total) * 100).toFixed(1) + "%" : "0%";
            return ` ${ctx.label}: ${val} (${pct})`;
          },
        },
      },
    },
  };
};

const chartDataComputed = computed(() => {
  const bgColors = getPaletteColors(props.values.length);

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

watch(isDarkTheme, updateChartOptions);

onMounted(() => {
  updateChartOptions();
  notifyChange();
});
</script>

<template>
  <div class="card h-full flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold m-0">Filtered Consumptions</h3>
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
            v-model="filters.time"
            :options="props.timeRanges"
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

    <div class="flex-1 w-full min-h-64 relative flex justify-center">
      <Chart
        type="doughnut"
        :data="chartDataComputed"
        :options="chartOptions"
        class="h-full w-full max-w-md"
        :class="{ 'opacity-50': props.loading }"
      />
    </div>
  </div>
</template>
