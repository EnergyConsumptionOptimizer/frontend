import { ONBOARDING_STEPS } from "@/config/onboardingSteps.js";

export function generateOnboardingRoutes() {
  return ONBOARDING_STEPS.map((step) => ({
    path: step.path,
    name: step.name,
    component: () => import(`@/views/onboarding/${step.component}.vue`),
    meta: {
      step: step.index,
    },
  }));
}
