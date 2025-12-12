import AppLayout from "@/layout/AppLayout.vue";

export const routes = [
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: false },
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
        //meta: { roles: ["admin"] },
      },
      {
        path: "users",
        name: "users",
        component: () => import("@/views/pages/Users.vue"),
        //meta: { roles: ["admin"] },
      },
      {
        path: "thresholds",
        name: "thresholds",
        component: () => import("@/views/pages/Thresholds.vue"),
        //meta: { roles: ["admin"] },
      },
      {
        path: "mapeditor",
        name: "mapeditor",
        component: () => import("@/views/pages/Empty.vue"),
        //meta: { roles: ["admin"] },
      },
      {
        path: "access-denied",
        name: "accessDenied",
        component: () => import("@/views/pages/Empty.vue"),
      },
    ],
  },
  {
    path: "/auth/login",
    name: "login",
    component: () => import("@/views/pages/auth/Login.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: "dashboard" },
  },
];
