<script setup>
import { ref, watch } from "vue";
import Tree from "primevue/tree";
import Panel from "primevue/panel";
import FloorPlanTreeSidebarNode from "@/components/interactiveMap/FloorPlanTreeSidebarNode.vue";
import Button from "primevue/button";

const props = defineProps({
  tree: { type: Array, required: true },
  hasZones: Boolean,
  hasZoneActions: { type: Boolean, default: false },
  disableActionsZone: { type: Boolean, default: false },
  hasSmartFurnitureHookupActions: { type: Boolean, default: false },
  disableActionsSmartFurnitureHookup: { type: Boolean, default: false },
});

const emit = defineEmits([
  "editZone",
  "deleteZone",
  "editSmartFurnitureHookup",
  "deleteSmartFurnitureHookup",
]);

const expandedKeys = ref(null);

watch(
  () => props.tree.length,
  (len) => {
    if (len) {
      expandedKeys.value = Object.fromEntries(
        props.tree.map((node) => [node.key, true]),
      );
    }
  },
  { once: true },
);
</script>

<template>
  <Panel
    class="h-full flex flex-col min-w-0 max-w-full"
    :pt="{
      header: { class: '!p-3 shrink-0' },
      toggleableContent: {
        class: '!flex-1 !min-h-0 !overflow-hidden !flex !flex-col',
      },
      content: {
        class:
          '!p-0 !flex-1 !overflow-y-auto !overflow-x-hidden custom-scrollbar',
      },
    }"
  >
    <template #header>
      <span class="font-bold">Floor Plan Zones</span>
    </template>

    <Tree
      :value="tree"
      :expandedKeys="expandedKeys"
      selectionMode="single"
      class="w-full border-none p-1"
      :pt="{
        root: { class: '!w-full' },
        wrapper: { class: '!w-full' },
        container: { class: '!w-full' },
        nodeContent: {
          class: '!flex !items-center !w-full !overflow-hidden !p-1',
        },
        nodeLabel: { class: '!flex-1 !min-w-0 !w-0' },
      }"
    >
      <template #zone="slotProps">
        <floor-plan-tree-sidebar-node
          :label="slotProps.node.label"
          :color="slotProps.node.color"
          indicatorClass="rounded-sm"
        >
          <template #actions v-if="props.hasZoneActions">
            <Button
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              class="!w-7 !h-7"
              :disabled="disableActionsZone"
              @click.stop="emit('editZone', slotProps.node.id)"
            />
            <Button
              icon="pi pi-trash"
              text
              rounded
              size="small"
              severity="danger"
              class="!w-7 !h-7"
              :disabled="disableActionsZone"
              @click.stop="emit('deleteZone', slotProps.node.id)"
            />
          </template>
        </floor-plan-tree-sidebar-node>
      </template>

      <template #smart-furniture-hookup="slotProps">
        <floor-plan-tree-sidebar-node
          :label="slotProps.node.label"
          :color="slotProps.node.isActive ? 'green' : 'gray'"
          indicatorClass="rounded-lg"
        >
          <template #actions v-if="props.hasSmartFurnitureHookupActions">
            <Button
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              class="!w-7 !h-7"
              :disabled="disableActionsSmartFurnitureHookup"
              @click.stop="emit('editSmartFurnitureHookup', slotProps.node.id)"
            />
            <Button
              icon="pi pi-trash"
              text
              rounded
              size="small"
              severity="danger"
              class="!w-7 !h-7"
              :disabled="disableActionsSmartFurnitureHookup"
              @click.stop="
                emit('deleteSmartFurnitureHookup', slotProps.node.id)
              "
            />
          </template>
        </floor-plan-tree-sidebar-node>
      </template>

      <template #empty>
        <div class="p-4 text-surface-500 text-sm text-center">
          {{
            props.hasZones ? "Manage your zones below" : "No zones created yet"
          }}
        </div>
      </template>
    </Tree>
  </Panel>
</template>

<style scoped></style>
