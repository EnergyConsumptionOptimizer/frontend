<script setup>
import { onMounted } from "vue";
import { useForecastStore } from "@/stores/forecastStore";
import ForecastWidget from "@/components/charts/ForecastWidget.vue";

const store = useForecastStore();

const UTILITIES = [
  { id: "ELECTRICITY", title: "Electricity" },
  { id: "GAS", title: "Gas" },
  { id: "WATER", title: "Water" },
];

onMounted(() => {
  store.fetchAll();
});
</script>

<template>
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12">
      <h1 class="text-3xl font-bold mb-2">Consumption Forecasts</h1>
    </div>

    <div
      v-for="utility in UTILITIES"
      :key="utility.id"
      class="col-span-12 xl:col-span-6"
    >
      <ForecastWidget :utility-type="utility.id" :title="utility.title" />
    </div>
  </div>
</template>
