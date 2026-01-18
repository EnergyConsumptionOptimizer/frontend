import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { AuthService } from "@/service/AuthService";
import { useAsyncAction } from "@/composables/utils/asyncAction";

const ROLES = { ADMIN: "admin", HOUSEHOLD: "household" };

// Lista di errori che vogliamo gestire MANUALMENTE nei form di Auth
const AUTH_MANUAL_ERRORS = [
  "UNAUTHORIZED",
  "BAD_REQUEST",
  "VALIDATION_ERROR",
  "INTERNAL_ERROR",
  "INFRASTRUCTURE_ERROR",
  "NETWORK_ERROR",
  "TIMEOUT",
];

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isInitialized = ref(false);

  const { isLoading, error, perform } = useAsyncAction();

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(
    () => user.value?.role?.toLowerCase() === ROLES.ADMIN,
  );
  const isHousehold = computed(
    () => user.value?.role?.toLowerCase() === ROLES.HOUSEHOLD,
  );

  const setUser = (payload) => (user.value = payload);
  const clearSession = () => {
    user.value = null;
    error.value = null;
  };

  const login = (credentials) =>
    perform(
      async () => {
        const data = await AuthService.login(credentials);
        setUser(data.user);
        isInitialized.value = true;
      },
      { suppressToastForCodes: AUTH_MANUAL_ERRORS },
    );

  const logout = () =>
    perform(async () => {
      try {
        await AuthService.logout();
      } finally {
        clearSession();
      }
    });

  const resetPassword = (code, password) =>
    perform(
      async () => {
        await AuthService.resetAdminPassword(code, password);
      },
      { suppressToastForCodes: AUTH_MANUAL_ERRORS },
    );

  const init = async () => {
    if (isInitialized.value) return;
    try {
      const data = await AuthService.verifySession();
      setUser(data.user);
    } catch {
      clearSession();
    } finally {
      isInitialized.value = true;
    }
  };

  const refreshToken = async () => {
    try {
      const data = await AuthService.refreshToken();
      if (data?.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      clearSession();
      return false;
    }
  };

  return {
    user,
    isInitialized,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isHousehold,
    init,
    login,
    logout,
    resetPassword,
    refreshToken,
  };
});
