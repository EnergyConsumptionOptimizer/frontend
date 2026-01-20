<script setup>
import { useLayout } from "@/layout/composables/useLayout";
import { onBeforeMount, ref, watch, computed } from "vue";
import { useRoute } from "vue-router";

defineOptions({
  name: "AppMenuItem",
});

const route = useRoute();
const { layoutState, setActiveMenuItem, toggleMenu } = useLayout();

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: 0,
  },
  root: {
    type: Boolean,
    default: true,
  },
  parentItemKey: {
    type: String,
    default: null,
  },
});

const isActiveMenu = ref(false);
const itemKey = ref(null);

// Determine if this menu item or any child is active
onBeforeMount(() => {
  itemKey.value = props.parentItemKey
    ? props.parentItemKey + "-" + props.index
    : String(props.index);
  const activeItem = layoutState.activeMenuItem;
  isActiveMenu.value =
    activeItem === itemKey.value ||
    (activeItem ? activeItem.startsWith(itemKey.value + "-") : false);
});

watch(
  () => layoutState.activeMenuItem,
  (newVal) => {
    isActiveMenu.value =
      newVal === itemKey.value || newVal.startsWith(itemKey.value + "-");
  },
);

// Check if current route matches this item
function checkActiveRoute(item) {
  return route.path === item.to;
}

// Computed ARIA attributes
const ariaExpanded = computed(() => {
  if (!props.item.items) return undefined;
  return isActiveMenu.value ? "true" : "false";
});

const ariaCurrent = computed(() => {
  if (!props.item.to) return undefined;
  return checkActiveRoute(props.item) ? "page" : undefined;
});

// Handle item click
function itemClick(event, item) {
  if (item.disabled) {
    event.preventDefault();
    return;
  }

  if (
    (item.to || item.url) &&
    (layoutState.staticMenuMobileActive || layoutState.overlayMenuActive)
  ) {
    toggleMenu();
  }

  if (item.command) {
    item.command({ originalEvent: event, item: item });
  }

  const foundItemKey = item.items
    ? isActiveMenu.value
      ? props.parentItemKey
      : itemKey
    : itemKey.value;

  setActiveMenuItem(foundItemKey);
}
</script>

<template>
  <li
    :class="{
      'layout-root-menuitem': root,
      'active-menuitem': isActiveMenu,
    }"
    role="none"
  >
    <div
      v-if="root && item.visible !== false"
      class="layout-menuitem-root-text"
      role="heading"
      aria-level="2"
    >
      {{ item.label }}
    </div>

    <a
      v-if="(!item.to || item.items) && item.visible !== false && !root"
      :href="item.url"
      @click="itemClick($event, item, index)"
      :class="item.class"
      :target="item.target"
      tabindex="0"
      role="menuitem"
      :aria-expanded="ariaExpanded"
      :aria-haspopup="item.items ? 'true' : undefined"
      :aria-label="item.label"
      class="min-h-11 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
    >
      <i :class="item.icon" class="layout-menuitem-icon" aria-hidden="true"></i>
      <span class="layout-menuitem-text">{{ item.label }}</span>
      <i
        v-if="item.items"
        class="pi pi-fw pi-angle-down layout-submenu-toggler"
        aria-hidden="true"
      ></i>
    </a>

    <router-link
      v-if="item.to && !item.items && item.visible !== false"
      @click="itemClick($event, item, index)"
      :class="[item.class, { 'active-route': checkActiveRoute(item) }]"
      tabindex="0"
      :to="item.to"
      role="menuitem"
      :aria-current="ariaCurrent"
      :aria-label="item.label"
      class="min-h-11 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
    >
      <i :class="item.icon" class="layout-menuitem-icon" aria-hidden="true"></i>
      <span class="layout-menuitem-text">{{ item.label }}</span>
      <i
        v-if="item.items"
        class="pi pi-fw pi-angle-down layout-submenu-toggler"
        aria-hidden="true"
      ></i>
    </router-link>

    <Transition
      v-if="item.items && item.visible !== false"
      name="layout-submenu"
    >
      <ul
        v-show="root ? true : isActiveMenu"
        class="layout-submenu"
        role="menu"
      >
        <app-menu-item
          v-for="(child, i) in item.items"
          :key="child.label || i"
          :index="i"
          :item="child"
          :parentItemKey="itemKey"
          :root="false"
        />
      </ul>
    </Transition>
  </li>
</template>
