<script setup>
import { useLayout } from "@/layout/composables/useLayout";
import { useAuthStore } from "@/stores/authsStore.js";
import { useAlertStore } from "@/stores/alertStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { computed, ref, onMounted, onUnmounted } from "vue";
import OverlayBadge from "primevue/overlaybadge";

const { toggleMenu, toggleDarkMode, isDarkTheme, layoutState } = useLayout();
const authStore = useAuthStore();
const alertStore = useAlertStore();
const { unreadCount } = storeToRefs(alertStore);
const { isAdmin } = storeToRefs(authStore);
const router = useRouter();

// State for mobile user menu
const mobileMenuOpen = ref(false);
const mobileMenuRef = ref(null);
const mobileMenuButtonRef = ref(null);

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

// Handle keyboard navigation (Escape key)
const handleKeyDown = (event) => {
  if (event.key === "Escape" && mobileMenuOpen.value) {
    closeMobileMenu();
    // Return focus to the toggle button
    mobileMenuButtonRef.value?.focus();
  }
};

// Set up and clean up event listeners
onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
});

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
        ref="mobileMenuButtonRef"
        class="layout-topbar-menu-button layout-topbar-action lg:hidden"
        type="button"
        :aria-label="mobileMenuOpen ? 'Close user menu' : 'Open user menu'"
        :aria-expanded="userMenuExpanded"
        aria-controls="topbar-user-menu"
        @click="toggleMobileMenu"
      >
        <i class="pi pi-ellipsis-v" aria-hidden="true"></i>
      </button>

      <!-- Click outside handler for mobile -->
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-998 lg:hidden"
        @click="closeMobileMenu"
        aria-hidden="true"
      ></div>

      <nav
        ref="mobileMenuRef"
        id="topbar-user-menu"
        :class="[
          'layout-topbar-menu',
          { 'layout-topbar-menu-mobile-active': mobileMenuOpen },
        ]"
        :aria-hidden="!mobileMenuOpen && 'true'"
        aria-label="User menu"
        role="menu"
      >
        <div class="layout-topbar-menu-content">
          <button
            type="button"
            class="layout-topbar-action w-full lg:w-auto"
            @click="toggleDarkMode"
            :aria-label="themeToggleLabel"
            role="menuitem"
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
            role="menuitem"
          >
            <i class="pi pi-sign-out" aria-hidden="true"></i>
            <span class="ml-2 lg:hidden">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>
