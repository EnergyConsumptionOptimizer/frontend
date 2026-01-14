import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";

export function useDashboardContext() {
  const userStore = useUserStore();

  const usersList = computed(() => [
    { label: "All Users", value: "all" },
    ...userStore.users.map((u) => ({ label: u.username, value: u.id })),
  ]);
  const zonesList = ref([{ label: "All Zones", value: "a" }]);

  onMounted(() => {
    userStore.fetchUsers();
  });

  return { usersList, zonesList };
}
