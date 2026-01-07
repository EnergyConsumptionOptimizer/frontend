<script setup>
import { onMounted } from "vue";
import { useThresholdStore } from "@/stores/thresholdStore";
import { useOnboardingStore } from "@/stores/onboarding";
import OnboardingStepLayout from "@/layout/OnboardingStepLayout.vue";
import ThresholdManagementView from "@/components/thresholds/ThresholdManagementView.vue";

const thresholdStore = useThresholdStore();
const onboardingStore = useOnboardingStore();

onMounted(() => {
  thresholdStore.setLocalMode(true);
  thresholdStore.fetchThresholds();
  onboardingStore.completeStep();
});
</script>

<template>
  <onboarding-step-layout
    title="Set Thresholds"
    subtitle="Configure your alert thresholds"
  >
    <template #content>
      <div class="w-full mt-4">
        <ThresholdManagementView :is-local-mode="true" />
      </div>
    </template>
  </onboarding-step-layout>
</template>
