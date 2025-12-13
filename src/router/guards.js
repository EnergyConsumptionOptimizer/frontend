export const createAuthGuard = async (to) => {
  const { useAuthStore } = await import("@/stores/auth");
  const authStore = useAuthStore();

  if (!authStore.isInitialized) {
    await authStore.init();
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isGuestOnly = to.matched.some((record) => record.meta.guestOnly);
  const isLoggedIn = authStore.isAuthenticated;

  if (requiresAuth && !isLoggedIn) {
    return {
      name: "login",
      query: { redirect: to.fullPath !== "/" ? to.fullPath : undefined },
    };
  }

  if (isGuestOnly && isLoggedIn) {
    return { name: "dashboard" };
  }

  if (to.meta.roles) {
    const userRole = authStore.user?.role;
    if (!to.meta.roles.includes(userRole)) {
      return { name: "accessDenied" };
    }
  }

  return true;
};
