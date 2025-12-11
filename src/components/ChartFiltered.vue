<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useLayout } from "@/layout/composables/layout";
import { ConsumptionService } from "@/service/MockConsumptionService";

defineOptions({ name: "ChartFiltered" });

const props = defineProps({
  users: {
    type: Array,
    default: () => [{ label: "All Users", value: "all" }],
  },
  zones: {
    type: Array,
    default: () => [{ label: "All Zones", value: "a" }],
  },
});

const UTILITIES = ["Electricity", "Gas", "Water"];
const TIME_RANGES = [
  { label: "1 Day", value: "1d" },
  { label: "5 Days", value: "5d" },
  { label: "1 Month", value: "1mo" },
  { label: "All", value: "all" },
];

const PALETTE = [
  "--p-primary-500",
  "--p-green-500",
  "--p-yellow-500",
  "--p-red-500",
  "--p-cyan-500",
  "--p-purple-500",
  "--p-gray-500",
];

const isDarkTheme = useLayout();
const isLoading = ref(false);
const chartData = ref();
const chartOptions = ref();

const filters = reactive({
  utility: "Electricity",
  time: TIME_RANGES[0],
  user: props.users[0],
  zone: props.zones[0],
});

const onUserChange = () => {
  if (filters.user.value !== props.users[0].value) {
    filters.zone = props.zones[0];
  }
};

const onZoneChange = () => {
  if (filters.zone.value !== props.zones[0].value) {
    filters.user = props.users[0];
  }
};

const getPaletteColors = (count) => {
  const style = getComputedStyle(document.documentElement);
  return Array.from({ length: count }).map((_, i) => {
    const varName = PALETTE[i % PALETTE.length];
    const hex = style.getPropertyValue(varName).trim() || "#cccccc";
    const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
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

const initData = async () => {
  isLoading.value = true;
  updateChartOptions();

  try {
    const res = await ConsumptionService.getConsumptions(filters);
    const bgColors = getPaletteColors(res.values.length);

    chartData.value = {
      labels: res.labels,
      datasets: [
        {
          data: res.values,
          backgroundColor: bgColors,
          borderColor: bgColors,
          borderWidth: 1,
        },
      ],
    };
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

watch([filters, isDarkTheme, () => props.users, () => props.zones], initData, {
  deep: true,
});

onMounted(initData);
</script>

<template>
  <div class="card h-full flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold m-0">Filtered Consumptions</h3>
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
            class="w-36"
            :disabled="isLoading"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <Dropdown
          v-model="filters.user"
          :options="props.users"
          optionLabel="label"
          class="w-32"
          :disabled="isLoading"
          @change="onUserChange"
        />
        <Dropdown
          v-model="filters.zone"
          :options="props.zones"
          optionLabel="label"
          class="w-32"
          :disabled="isLoading"
          @change="onZoneChange"
        />
      </div>
    </div>

    <div class="flex-1 w-full min-h-64 relative flex justify-center">
      <Chart
        type="doughnut"
        :data="chartData"
        :options="chartOptions"
        class="h-full w-full max-w-md"
        :class="{ 'opacity-50': isLoading }"
      />
    </div>
  </div>
</template>
