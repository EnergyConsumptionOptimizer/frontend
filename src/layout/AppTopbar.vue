<script setup>
import { useLayout } from "@/layout/composables/useLayout";
import { useAuthStore } from "@/stores/authsStore.js";
import { useAlertStore } from "@/stores/alertStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import OverlayBadge from "primevue/overlaybadge";

const { toggleMenu, toggleDarkMode, isDarkTheme, layoutState } = useLayout();
const authStore = useAuthStore();
const alertStore = useAlertStore();
const { unreadCount } = storeToRefs(alertStore);
const { isAdmin } = storeToRefs(authStore);
const router = useRouter();

// State for mobile user menu
const mobileMenuOpen = ref(false);

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: "login" });
};

const goToAlerts = () => {
  router.push({ name: "alerts" });
};

// Toggle mobile user menu
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

// Close mobile menu when clicking outside
const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

// Computed ARIA attributes
const menuButtonExpanded = computed(() => {
  return layoutState.staticMenuMobileActive || layoutState.overlayMenuActive;
});

const userMenuExpanded = computed(() => mobileMenuOpen.value);

// Computed labels
const themeToggleLabel = computed(() =>
  isDarkTheme.value ? "Switch to Light Mode" : "Switch to Dark Mode",
);

const alertsLabel = computed(() =>
  unreadCount.value > 0 ? `Alerts (${unreadCount.value} unread)` : "Alerts",
);
</script>

<template>
  <header class="layout-topbar" role="banner">
    <div class="layout-topbar-logo-container">
      <button
        class="layout-menu-button layout-topbar-action"
        @click="toggleMenu"
        type="button"
        aria-label="Toggle navigation menu"
        :aria-expanded="menuButtonExpanded"
        aria-controls="layout-sidebar"
      >
        <i class="pi pi-bars text-lg" aria-hidden="true"></i>
      </button>

      <router-link
        to="/"
        class="layout-topbar-logo"
        aria-label="Energy Consumption Optimizer - Go to Dashboard"
      >
        <i class="pi pi-home text-primary text-4xl" aria-hidden="true"></i>
        <span class="text-xl font-semibold">E.C.O.</span>
      </router-link>
    </div>

    <div class="layout-topbar-actions">
      <div v-if="isAdmin" class="layout-config-menu">
        <button
          type="button"
          class="layout-topbar-action"
          @click="goToAlerts"
          :aria-label="alertsLabel"
        >
          <overlay-badge
            v-if="unreadCount > 0"
            :value="unreadCount"
            severity="danger"
            size="small"
          >
            <i class="pi pi-bell" aria-hidden="true"></i>
          </overlay-badge>
          <i v-else class="pi pi-bell" aria-hidden="true"></i>
          <span class="hidden lg:inline ml-2">Alerts</span>
        </button>
      </div>

      <button
        class="layout-topbar-menu-button layout-topbar-action lg:hidden"
        type="button"
        aria-label="Open user menu"
        :aria-expanded="userMenuExpanded"
        aria-controls="topbar-user-menu"
        @click="toggleMobileMenu"
      >
        <i class="pi pi-ellipsis-v" aria-hidden="true"></i>
      </button>

      <nav
        id="topbar-user-menu"
        :class="[
          'layout-topbar-menu',
          'hidden lg:block',
          {
            'absolute right-8 top-16 bg-surface-0 dark:bg-surface-900 shadow-lg rounded-lg border border-surface-200 dark:border-surface-700 p-4 z-50 min-w-48':
              mobileMenuOpen,
            block: mobileMenuOpen,
          },
        ]"
        aria-label="User menu"
      >
        <!-- Click outside handler for mobile -->
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 z-40 lg:hidden"
          @click="closeMobileMenu"
          aria-hidden="true"
        ></div>

        <div class="layout-topbar-menu-content relative z-50">
          <button
            type="button"
            class="layout-topbar-action w-full lg:w-auto"
            @click="toggleDarkMode"
            :aria-label="themeToggleLabel"
          >
            <i
              :class="['pi', isDarkTheme ? 'pi-moon' : 'pi-sun']"
              aria-hidden="true"
            ></i>
            <span class="ml-2 lg:hidden">
              {{ isDarkTheme ? "Dark Mode" : "Light Mode" }}
            </span>
          </button>

          <button
            type="button"
            class="layout-topbar-action w-full lg:w-auto"
            @click="handleLogout"
            aria-label="Logout"
          >
            <i class="pi pi-sign-out" aria-hidden="true"></i>
            <span class="ml-2 lg:hidden">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>
