<script setup>
import { useLayout } from "@/layout/composables/layout";
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import StatsCard from "@/components/StatsCard.vue";
import IconElectricity from "@/assets/icons/electricity.svg?component";
import IconGas from "@/assets/icons/gas.svg?component";
import IconWater from "@/assets/icons/water.svg?component";
import ChartRealTime from "@/components/ChartRealTime.vue";
import ChartHistorical from "@/components/ChartHistorical.vue";
import ChartFiltered from "@/components/ChartFiltered.vue";
import { MockedUserService } from "@/service/MockedUserService";
import { ConsumptionService } from "@/service/MockConsumptionService";

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const CONFIG = {
  utilities: ["Electricity", "Gas", "Water"],
  timeRanges: [
    { label: "1 Day", value: "1d" },
    { label: "5 Days", value: "5d" },
    { label: "1 Month", value: "1mo" },
    { label: "All", value: "all" },
  ],
  granularities: [
    { label: "5 Min", value: "5m" },
    { label: "1 Hour", value: "1h" },
    { label: "1 Day", value: "1d" },
  ],
  histGranularities: [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
  ],
};

const usersList = ref([{ label: "All Users", value: "all" }]);
const zonesList = ref([{ label: "All Zones", value: "a" }]);

const electricityColor = ref("#000000");
const gasColor = ref("#000000");
const waterColor = ref("#000000");

const rtData = reactive({ labels: [], values: [] });
const rtLoading = ref(false);
let rtTimer = null;

const histData = reactive({ labels: [], values: [] });
const histLoading = ref(false);

const filtData = reactive({ labels: [], values: [] });
const filtLoading = ref(false);

function updateColors() {
  const documentStyle = getComputedStyle(document.documentElement);
  electricityColor.value = documentStyle
    .getPropertyValue("--p-electricity-500")
    .trim();
  gasColor.value = documentStyle.getPropertyValue("--p-gas-500").trim();
  waterColor.value = documentStyle.getPropertyValue("--p-water-500").trim();
}

const loadContextData = async () => {
  try {
    const [usersData] = await Promise.all([MockedUserService.getUsers()]);
    const formattedUsers = usersData.map((u) => ({
      label: u.username,
      value: u._id,
    }));
    usersList.value = [{ label: "All Users", value: "all" }, ...formattedUsers];
  } catch (e) {
    console.error(e);
  }
};

const handleRtFilterChange = async (filters) => {
  if (rtTimer) clearInterval(rtTimer);
  rtLoading.value = true;

  try {
    const res = await ConsumptionService.getConsumptions(filters);
    rtData.labels = res.labels;
    rtData.values = res.values;

    rtTimer = setInterval(async () => {
      const lastVal = rtData.values[rtData.values.length - 1];
      const point = await ConsumptionService.getNextValue(
        lastVal,
        filters.utility,
      );
      rtData.labels = [...rtData.labels.slice(1), point.label];
      rtData.values = [...rtData.values.slice(1), point.value];
    }, 2000);
  } catch (err) {
    console.error(err);
  } finally {
    rtLoading.value = false;
  }
};

const handleHistFilterChange = async (filters) => {
  histLoading.value = true;
  try {
    const res = await ConsumptionService.getConsumptions(filters);
    histData.labels = res.labels;
    histData.values = res.values;
  } catch (err) {
    console.error(err);
  } finally {
    histLoading.value = false;
  }
};

const handleFiltFilterChange = async (filters) => {
  filtLoading.value = true;
  try {
    const res = await ConsumptionService.getConsumptions(filters);
    filtData.labels = res.labels;
    filtData.values = res.values;
  } catch (err) {
    console.error(err);
  } finally {
    filtLoading.value = false;
  }
};

onMounted(() => {
  updateColors();
  loadContextData();
});

onUnmounted(() => {
  if (rtTimer) clearInterval(rtTimer);
});

watch([getPrimary, getSurface, isDarkTheme], updateColors, { immediate: true });
</script>

<template>
  <h1>Dashboard</h1>
  <Fluid class="grid grid-cols-12 gap-8">
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <StatsCard
        label="Electricity"
        value="14.41"
        unit="kWh"
        :color="electricityColor"
      >
        <template #icon
          ><IconElectricity class="w-7 h-7 fill-current"
        /></template>
      </StatsCard>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <StatsCard label="Gas" value="14.41" unit="Smc" :color="gasColor">
        <template #icon><IconGas class="w-7 h-7 fill-current" /></template>
      </StatsCard>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <StatsCard label="Water" value="14.41" unit="Smc" :color="waterColor">
        <template #icon><IconWater class="w-7 h-7 fill-current" /></template>
      </StatsCard>
    </div>

    <div class="col-span-12 xl:col-span-6">
      <ChartRealTime
        :users="usersList"
        :zones="zonesList"
        :utilities="CONFIG.utilities"
        :time-ranges="CONFIG.timeRanges"
        :granularities="CONFIG.granularities"
        :labels="rtData.labels"
        :values="rtData.values"
        :loading="rtLoading"
        @filter-change="handleRtFilterChange"
      />
    </div>

    <div class="col-span-12 xl:col-span-6">
      <ChartHistorical
        :users="usersList"
        :zones="zonesList"
        :utilities="CONFIG.utilities"
        :granularities="CONFIG.histGranularities"
        :labels="histData.labels"
        :values="histData.values"
        :loading="histLoading"
        @filter-change="handleHistFilterChange"
      />
    </div>

    <div class="col-span-12 xl:col-span-6">
      <ChartFiltered
        :users="usersList"
        :zones="zonesList"
        :utilities="CONFIG.utilities"
        :time-ranges="CONFIG.timeRanges"
        :labels="filtData.labels"
        :values="filtData.values"
        :loading="filtLoading"
        @filter-change="handleFiltFilterChange"
      />
    </div>
  </Fluid>
</template>
