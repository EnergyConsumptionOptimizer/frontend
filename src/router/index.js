import { createRouter, createWebHistory } from "vue-router";
import { createAuthGuard } from "./guards";
import { routes } from "./routes";

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

router.beforeEach(createAuthGuard);

export default router;
