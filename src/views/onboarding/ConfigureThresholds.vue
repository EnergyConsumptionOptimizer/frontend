<script setup>
import { onBeforeMount, onMounted } from "vue";
import { useThresholdStore } from "@/stores/thresholdStore";
import { useOnboardingStore } from "@/stores/onboarding";
import OnboardingStepLayout from "@/layout/OnboardingStepLayout.vue";
import ThresholdManagementView from "@/components/thresholds/ThresholdManagementView.vue";

const thresholdStore = useThresholdStore();
const onboardingStore = useOnboardingStore();

onBeforeMount(() => {
  thresholdStore.setLocalMode(true);
});

onMounted(() => {
  onboardingStore.completeStep();
});
</script>

<template>
  <OnboardingStepLayout
    title="Set Thresholds"
    subtitle="Configure your alert thresholds"
  >
    <template #content>
      <div class="w-full">
        <ThresholdManagementView />
      </div>
    </template>
  </OnboardingStepLayout>
</template>
