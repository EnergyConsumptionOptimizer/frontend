import { ref, onMounted } from "vue";
import { MockedUserService } from "@/service/mock/MockedUserService";

export function useDashboardContext() {
  const usersList = ref([{ label: "All Users", value: "all" }]);
  const zonesList = ref([{ label: "All Zones", value: "a" }]);

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

  onMounted(loadContext);

  return { usersList, zonesList };
}
