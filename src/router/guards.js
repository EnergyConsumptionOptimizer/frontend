export const createOnboardingGuard = async (to) => {
  const { useOnboardingStore } = await import("@/stores/onboarding.js");
  const onboardingStore = useOnboardingStore();

  if (!onboardingStore.isInitialized) {
    await onboardingStore.init();
  }

  const isOnboardingComplete = onboardingStore.isComplete;
  const isOnboardingRoute = to.matched.some(
    (record) => record.meta.onboardingPhase,
  );

  const isGuestRoute = to.matched.some((record) => record.meta.guestOnly);

  if (isGuestRoute) {
    return true;
  }

  if (isOnboardingComplete && isOnboardingRoute) {
    return { name: "dashboard" };
  }

  if (!isOnboardingComplete && !isOnboardingRoute) {
    return { name: "onboarding" };
  }

  const requestedStep = to.meta.step;

  if (requestedStep) {
    if (!onboardingStore.canAccessStep(requestedStep)) {
      return {
        name: onboardingStore.getNameByStep(
          onboardingStore.getCurrentStepIndex,
        ),
      };
    }

    onboardingStore.setCurrentStep(requestedStep);
  }

  return true;
};

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
