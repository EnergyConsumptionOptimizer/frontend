<script setup>
import InteractiveMap from "@/components/interactiveMap/InteractiveMap.vue";
import { useOnboardingStore } from "@/stores/onboarding.js";
import OnboardingStepLayout from "@/layout/OnboardingStepLayout.vue";

const onboardingStore = useOnboardingStore();

async function handleSaveSmartFurnitureHookup(smartFurnitureHookupsLength) {
  if (smartFurnitureHookupsLength === 1) {
    onboardingStore.completeStep();
  }
}

async function handleDeleteSmartFurnitureHookup(smartFurnitureHookupsLength) {
  if (smartFurnitureHookupsLength === 0) {
    onboardingStore.uncompleteStep();
  }
}
</script>

<template>
  <OnboardingStepLayout
    title="Create smart furniture hookups"
    subtitle="Create smart furniture hookups and position them on the floor plan"
  >
    <template #content>
      <div class="w-full">
        <InteractiveMap
          :is-local-mode="true"
          :manage-zones="false"
          @smart-furniture-hookup-created="handleSaveSmartFurnitureHookup"
          @smart-furniture-hookup-deleted="handleDeleteSmartFurnitureHookup"
        />
      </div>
    </template>
  </OnboardingStepLayout>
</template>
