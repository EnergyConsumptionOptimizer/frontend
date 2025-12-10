export const createAuthGuard = async (to, from, next) => {
  const { useAuthStore } = await import("@/stores/auth");
  const authStore = useAuthStore();

  if (!authStore.isInitialized) {
    await authStore.init();
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isGuestOnly = to.matched.some((record) => record.meta.guestOnly);
  const isLoggedIn = authStore.isAuthenticated;

  if (requiresAuth && !isLoggedIn) {
    const query = to.fullPath === "/" ? {} : { redirect: to.fullPath };
    return next({ name: "login", query });
  }

  if (isGuestOnly && isLoggedIn) {
    return next({ name: "dashboard" });
  }

  if (to.meta.roles) {
    const requiredRoles = to.meta.roles;
    const userRole = authStore.user?.role;

    if (!requiredRoles.includes(userRole)) {
      return next({ name: "accessDenied" });
    }
  }

  return next();
};
