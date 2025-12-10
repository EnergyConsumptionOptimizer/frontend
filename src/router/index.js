import { createRouter, createWebHistory } from "vue-router";
import { createAuthGuard } from "./guards";
import { routes } from "./routes";

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

router.beforeEach(createAuthGuard);

export default router;
