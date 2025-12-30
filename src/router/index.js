import { createRouter, createWebHistory } from "vue-router";
import { createAuthGuard, createOnboardingGuard } from "./guards";
import { routes } from "./routes";

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  const onboardingResult = await createOnboardingGuard(to);

  if (onboardingResult !== true) {
    next(onboardingResult);
    return;
  }

  const authResult = await createAuthGuard(to);
  if (authResult !== true) {
    next(authResult);
    return;
  }
  next();
});

export default router;
