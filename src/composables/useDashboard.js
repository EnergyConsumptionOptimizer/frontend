import { ref, reactive, watch, onMounted } from "vue";
import { useLayout } from "@/layout/composables/useLayout";
import { MockedUserService } from "@/service/mock/MockedUserService";

export function useDashboardContext() {
  const { getPrimary, getSurface, isDarkTheme } = useLayout();

  const usersList = ref([{ label: "All Users", value: "all" }]);
  const zonesList = ref([{ label: "All Zones", value: "a" }]);
  const colors = reactive({
    electricity: "#FFFFFF",
    gas: "#FFFFFF",
    water: "#FFFFFF",
  });

  const loadContext = async () => {
    try {
      const [users] = await Promise.all([MockedUserService.getUsers()]);
      usersList.value = [
        { label: "All Users", value: "all" },
        ...users.map((u) => ({ label: u.username, value: u._id })),
      ];
    } catch (e) {
      console.error(e);
    }
  };

  const updateColors = () => {
    const s = getComputedStyle(document.documentElement);
    colors.electricity = s.getPropertyValue("--p-electricity-500").trim();
    colors.gas = s.getPropertyValue("--p-gas-500").trim();
    colors.water = s.getPropertyValue("--p-water-500").trim();
  };

  watch([getPrimary, getSurface, isDarkTheme], updateColors, {
    immediate: true,
  });
  onMounted(loadContext);

  return { usersList, zonesList, colors };
}
