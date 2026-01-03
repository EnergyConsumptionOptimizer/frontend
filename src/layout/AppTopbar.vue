<script setup>
import { useLayout } from "@/layout/composables/useLayout";
import { useAuthStore } from "@/stores/auth";
import { useAlertStore } from "@/stores/alertStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const authStore = useAuthStore();
const alertStore = useAlertStore();
const { unreadCount } = storeToRefs(alertStore);
const { isAdmin } = storeToRefs(authStore);
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: "login" });
};

const goToAlerts = () => {
  router.push({ name: "alerts" });
};
</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container flex items-center gap-3">
      <button
        class="layout-menu-button layout-topbar-action flex items-center justify-center px-4 py-3"
        @click="toggleMenu"
      >
        <i class="pi pi-bars text-lg"></i>
      </button>
      <router-link
        to="/"
        class="layout-topbar-logo flex items-center gap-2 no-underline"
      >
        <i class="pi pi-home text-primary text-4xl"></i>
        <span class="text-xl font-semibold whitespace-nowrap">E.C.O.</span>
      </router-link>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button
          v-if="isAdmin"
          type="button"
          class="layout-topbar-action"
          @click="goToAlerts"
        >
          <OverlayBadge
            v-if="unreadCount > 0"
            :value="unreadCount"
            severity="danger"
            size="small"
          >
            <i class="pi pi-bell"></i>
          </OverlayBadge>

          <i v-else class="pi pi-bell"></i>

          <span>Alerts</span>
        </button>
      </div>

      <button
        class="layout-topbar-menu-button layout-topbar-action"
        v-styleclass="{
          selector: '@next',
          enterFromClass: 'hidden',
          enterActiveClass: 'animate-scalein',
          leaveToClass: 'hidden',
          leaveActiveClass: 'animate-fadeout',
          hideOnOutsideClick: true,
        }"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <button
            type="button"
            class="layout-topbar-action"
            @click="toggleDarkMode"
          >
            <i
              :class="[
                'pi',
                { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme },
              ]"
            ></i>
            <span>Switch Theme</span>
          </button>
          <button
            type="button"
            class="layout-topbar-action"
            @click="handleLogout"
          >
            <i class="pi pi-sign-out"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
