<script setup>
import { useLayout } from "@/layout/composables/layout";
import { onMounted, ref, watch } from "vue";
import StatsCard from "@/components/StatsCard.vue";
import IconElectricity from "@/assets/icons/electricity.svg?component";
import IconGas from "@/assets/icons/gas.svg?component";
import IconWater from "@/assets/icons/water.svg?component";
import ChartRealTime from "@/components/ChartRealTime.vue";
import ChartHistorical from "@/components/ChartHistorical.vue";
import ChartFiltered from "@/components/ChartFiltered.vue";
import { MockedUserService } from "@/service/MockedUserService";

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const usersList = ref([{ label: "All Users", value: "all" }]);

const electricityColor = ref("#000000");
const gasColor = ref("#000000");
const waterColor = ref("#000000");

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
    console.error("Context load error", e);
  }
};

onMounted(() => {
  updateColors();
  loadContextData();
});

watch(
  [getPrimary, getSurface, isDarkTheme],
  () => {
    updateColors();
  },
  { immediate: true },
);
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
        <template #icon>
          <IconElectricity class="w-7 h-7 fill-current" />
        </template>
      </StatsCard>
    </div>

    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <StatsCard label="Gas" value="14.41" unit="Smc" :color="gasColor">
        <template #icon>
          <IconGas class="w-7 h-7 fill-current" />
        </template>
      </StatsCard>
    </div>

    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <StatsCard label="Water" value="14.41" unit="Smc" :color="waterColor">
        <template #icon>
          <IconWater class="w-7 h-7 fill-current" />
        </template>
      </StatsCard>
    </div>

    <div class="col-span-12 xl:col-span-6">
      <ChartRealTime :users="usersList" />
    </div>
    <div class="col-span-12 xl:col-span-6">
      <ChartHistorical :users="usersList" />
    </div>
    <div class="col-span-12 xl:col-span-6">
      <ChartFiltered :users="usersList" />
    </div>
  </Fluid>
</template>
