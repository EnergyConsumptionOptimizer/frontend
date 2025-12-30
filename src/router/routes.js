import AppLayout from "@/layout/AppLayout.vue";
import OnboardingLayout from "@/layout/OnboardingLayout.vue";
import { useOnboardingStore } from "@/stores/onboarding.js";
import { generateOnboardingRoutes } from "@/utils/generateOnboardingRoutes.js";

export const routes = [
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "dashboard",
        component: () => import("@/views/Dashboard.vue"),
      },
      {
        path: "forecasts",
        name: "forecasts",
        component: () => import("@/views/pages/Forecasts.vue"),
      },
      {
        path: "users",
        name: "users",
        component: () => import("@/views/pages/Users.vue"),
        meta: { roles: ["admin"] },
      },
      {
        path: "thresholds",
        name: "thresholds",
        component: () => import("@/views/pages/Thresholds.vue"),
        meta: { roles: ["admin"] },
      },
      {
        path: "mapeditor",
        name: "mapeditor",
        component: () => import("@/views/pages/Empty.vue"),
        meta: { roles: ["admin"] },
      },
      {
        path: "access-denied",
        name: "accessDenied",
        component: () => import("@/views/pages/Empty.vue"),
      },
    ],
  },
  {
    path: "/onboarding",
    component: OnboardingLayout,
    meta: {
      onboardingPhase: true,
      requiresAuth: true,
    },
    children: [
      {
        path: "",
        name: "onboarding",
        redirect: () => {
          const store = useOnboardingStore();
          const currentPath = store.getPathByStep(store.getCurrentStepIndex);
          return currentPath
            ? `/onboarding/${currentPath}`
            : `/onboarding/${store.getPathByStep(1)}`;
        },
      },
      ...generateOnboardingRoutes(),
    ],
  },
  {
    path: "/auth/login",
    name: "login",
    component: () => import("@/views/pages/auth/Login.vue"),
    meta: { guestOnly: true },
  },
  /*
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "dashboard" },
    },
    */
];
