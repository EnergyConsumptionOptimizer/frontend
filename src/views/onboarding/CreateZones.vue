<script setup>
import InteractiveMap from "@/components/interactiveMap/InteractiveMap.vue";
import { onMounted } from "vue";
import { useOnboardingStore } from "@/stores/onboarding.js";
import OnboardingStepLayout from "@/layout/OnboardingStepLayout.vue";

const onboardingStore = useOnboardingStore();
onMounted(() => {
  onboardingStore.completeStep();
});
</script>

<template>
  <onboarding-step-layout
    title="Create zones"
    subtitle="Draw polygons on the floor plan to create new zones"
  >
    <template #content>
      <interactive-map
        :is-local-mode="true"
        :manage-smart-furniture-hookups="false"
      />
    </template>
  </onboarding-step-layout>
</template>

<style scoped></style>
