<script setup>
import { useAuthStore } from "@/stores/authsStore.js";
import { computed } from "vue";
import AppMenuItem from "./AppMenuItem.vue";

const authStore = useAuthStore();

const model = computed(() => [
  {
    label: "Home",
    visible: true,
    items: [
      {
        label: "Dashboard",
        icon: "pi pi-fw pi-home",
        to: "/",
      },
    ],
  },
  {
    label: "Analytics",
    visible: true,
    items: [
      {
        label: "Forecasts",
        icon: "pi pi-fw pi-chart-line",
        to: "/forecasts",
      },
    ],
  },
  {
    label: "Admin",
    visible: authStore.isAdmin,
    items: [
      {
        label: "Map Editor",
        icon: "pi pi-fw pi-map",
        to: "/mapeditor",
      },
      {
        label: "Users",
        icon: "pi pi-fw pi-users",
        to: "/users",
      },
      {
        label: "Thresholds",
        icon: "pi pi-fw pi-sliders-v",
        to: "/thresholds",
      },
    ],
  },
]);
</script>

<template>
  <nav aria-label="Main menu">
    <ul class="layout-menu" role="list">
      <template v-for="(item, i) in model" :key="i">
        <app-menu-item
          v-if="!item.separator && item.visible"
          :item="item"
          :index="i"
        />
        <li
          v-if="item.separator"
          class="menu-separator"
          role="separator"
          aria-hidden="true"
        />
      </template>
    </ul>
  </nav>
</template>
