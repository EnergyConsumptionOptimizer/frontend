<script setup>
import { useLayout } from "@/layout/composables/layout";
import { onMounted, ref, watch } from "vue";

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const lineData = ref(null);
const lineOptions = ref(null);

onMounted(() => {
  setColorOptions();
});

function setColorOptions() {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColorSecondary = documentStyle.getPropertyValue(
    "--text-color-secondary",
  );
  const surfaceBorder = documentStyle.getPropertyValue("--surface-border");

  lineData.value = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        backgroundColor: documentStyle.getPropertyValue("--p-primary-500"),
        borderColor: documentStyle.getPropertyValue("--p-primary-500"),
        tension: 0.4,
      },
    ],
  };

  lineOptions.value = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
          drawBorder: true,
        },
      },
    },
  };
}

watch(
  [getPrimary, getSurface, isDarkTheme],
  () => {
    setColorOptions();
  },
  { immediate: true },
);
</script>

<template>
  <h1>Real-Time Consumptions</h1>
  <Fluid class="grid grid-cols-12 gap-8">
    <div class="col-span-12 xl:col-span-4">
      <div class="card">
        <div class="font-semibold text-l mb-4">Water</div>
        <Chart type="line" :data="lineData" :options="lineOptions"></Chart>
      </div>
    </div>
    <div class="col-span-12 xl:col-span-4">
      <div class="card">
        <div class="font-semibold text-l mb-4">Gas</div>
        <Chart type="line" :data="lineData" :options="lineOptions"></Chart>
      </div>
    </div>
    <div class="col-span-12 xl:col-span-4">
      <div class="card">
        <div class="font-semibold text-l mb-4">Electricity</div>
        <Chart type="line" :data="lineData" :options="lineOptions"></Chart>
      </div>
    </div>
  </Fluid>
</template>
