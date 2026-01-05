import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { UserService } from "@/service/UserService";

const ROLES = {
  ADMIN: "admin",
  HOUSEHOLD: "household",
};

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isInitialized = ref(false);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(
    () => user.value?.role?.toLowerCase() === ROLES.ADMIN,
  );
  const isHousehold = computed(
    () => user.value?.role?.toLowerCase() === ROLES.HOUSEHOLD,
  );

  const setUser = (payload) => (user.value = payload);
  const clearSession = () => (user.value = null);

  async function init() {
    if (isInitialized.value) return;
    try {
      const data = await UserService.verifySession();
      setUser(data.user);
    } catch {
      clearSession();
    } finally {
      isInitialized.value = true;
    }
  }

  async function login(credentials) {
    const data = await UserService.login(credentials);
    setUser(data.user);
    isInitialized.value = true;
    return true;
  }

  async function logout() {
    try {
      await UserService.logout();
    } catch (error) {
      console.warn("Logout failed", error);
    } finally {
      clearSession();
    }
  }

  async function refreshToken() {
    try {
      const data = await UserService.refreshToken();
      if (data?.user) {
        setUser(data.user);
        isInitialized.value = true;
        return true;
      }
      return false;
    } catch {
      clearSession();
      return false;
    }
  }

  async function resetPassword(resetCode, password) {
    isLoading.value = true;
    try {
      await UserService.resetAdminPassword(resetCode, password);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    user,
    isInitialized,
    isLoading,
    isAuthenticated,
    isAdmin,
    isHousehold,
    init,
    login,
    logout,
    refreshToken,
    resetPassword,
  };
});
