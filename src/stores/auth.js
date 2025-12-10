import apiClient from "@/middlewares/authInterceptor";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

const ROLES = {
  ADMIN: "admin",
  HOUSEHOLD: "household",
};

const API = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  VERIFY: "/auth/verify",
};

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isInitialized = ref(false);
  const isAuthenticated = computed(() => !!user.value);

  const isAdmin = computed(
    () => user.value?.role.toLowerCase() === ROLES.ADMIN,
  );

  const isHousehold = computed(
    () => user.value?.role.toLowerCase() === ROLES.HOUSEHOLD,
  );

  function setUser(payload) {
    user.value = payload;
  }

  function clearSession() {
    user.value = null;
  }

  async function init() {
    if (isInitialized.value) return;

    try {
      const { data } = await apiClient.get(API.VERIFY);
      setUser(data.user);
    } catch (e) {
      clearSession();
    } finally {
      isInitialized.value = true;
    }
  }

  async function login(credentials) {
    const { data } = await apiClient.post(API.LOGIN, credentials);
    setUser(data.user);
    isInitialized.value = true;
    return true;
  }

  async function logout() {
    try {
      await apiClient.post(API.LOGOUT);
    } catch (e) {
      console.warn("Logout API failed, clearing session anyway", e);
    } finally {
      clearSession();
    }
  }

  async function refreshToken() {
    try {
      const { data } = await apiClient.post(API.REFRESH);

      if (data.user) {
        setUser(data.user);
        isInitialized.value = true;
        return true;
      }
      throw new Error("Refresh failed: No user data");
    } catch (e) {
      clearSession();
      return false;
    }
  }

  return {
    user,
    isInitialized,
    isAuthenticated,
    isAdmin,
    isHousehold,
    init,
    login,
    logout,
    refreshToken,
  };
});
