<script setup>
import { onMounted } from "vue";

// Announce route changes to screen readers
const announceRouteChange = (to) => {
  const announcement = document.getElementById("route-announcer");
  if (announcement) {
    announcement.textContent = `Navigated to ${to.meta.title || to.name || "page"}`;
  }
};

onMounted(() => {
  const router = window?.$router;
  if (router) {
    router.afterEach((to) => {
      announceRouteChange(to);
    });
  }
});
</script>

<template>
  <div id="app" class="min-h-screen">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-contrast focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      Skip to main content
    </a>

    <!-- Screen reader announcements for route changes -->
    <div
      id="route-announcer"
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    ></div>
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>
