<script setup>
import { useLayout } from "@/layout/composables/useLayout";
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import AppFooter from "./AppFooter.vue";
import AppSidebar from "./AppSidebar.vue";
import AppTopbar from "./AppTopbar.vue";

const { layoutConfig, layoutState, isSidebarActive } = useLayout();

const outsideClickListener = ref(null);

// Container classes based on layout state
const containerClass = computed(() => ({
  "layout-overlay": layoutConfig.menuMode === "overlay",
  "layout-static": layoutConfig.menuMode === "static",
  "layout-static-inactive":
    layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === "static",
  "layout-overlay-active": layoutState.overlayMenuActive,
  "layout-mobile-active": layoutState.staticMenuMobileActive,
}));

// Watch for sidebar state changes
watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener();
    document.body.classList.add("blocked-scroll");
  } else {
    unbindOutsideClickListener();
    document.body.classList.remove("blocked-scroll");
  }
});

// Click outside to close sidebar
function bindOutsideClickListener() {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        layoutState.overlayMenuActive = false;
        layoutState.staticMenuMobileActive = false;
        layoutState.menuHoverActive = false;
      }
    };
    document.addEventListener("click", outsideClickListener.value);
  }
}

function unbindOutsideClickListener() {
  if (outsideClickListener.value) {
    document.removeEventListener("click", outsideClickListener.value);
    outsideClickListener.value = null;
  }
}

function isOutsideClicked(event) {
  const sidebarEl = document.querySelector(".layout-sidebar");
  const topbarEl = document.querySelector(".layout-menu-button");

  return !(
    sidebarEl?.isSameNode(event.target) ||
    sidebarEl?.contains(event.target) ||
    topbarEl?.isSameNode(event.target) ||
    topbarEl?.contains(event.target)
  );
}

onUnmounted(() => {
  unbindOutsideClickListener();
  document.body.classList.remove("blocked-scroll");
});

// Focus management: set focus to main content on mount
onMounted(() => {
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.setAttribute("tabindex", "-1");
  }
});
</script>

<template>
  <div class="layout-wrapper" :class="containerClass">
    <AppTopbar />
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="layout-main-container">
      <main id="main-content" class="layout-main" tabindex="-1">
        <router-view />
      </main>
      <AppFooter />
    </div>

    <div
      v-if="isSidebarActive"
      class="layout-mask animate-fadein"
      @click="
        layoutState.staticMenuMobileActive = false;
        layoutState.overlayMenuActive = false;
      "
      role="presentation"
      aria-hidden="true"
    ></div>

    <Toast position="top-right" />
    <ConfirmDialog />
  </div>
</template>
