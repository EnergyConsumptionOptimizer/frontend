<script setup>
import { onMounted, onBeforeMount } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useOnboardingStore } from "@/stores/onboarding";
import OnboardingStepLayout from "@/layout/OnboardingStepLayout.vue";
import UserManagementView from "@/components/users/UserManagementView.vue";

const userStore = useUserStore();
const onboardingStore = useOnboardingStore();

onBeforeMount(() => {
  userStore.setLocalMode(true);
});

onMounted(() => {
  onboardingStore.completeStep();
});
</script>

<template>
  <OnboardingStepLayout
    title="Household Users"
    subtitle="Add users that live in the house"
  >
    <template #content>
      <div class="w-full">
        <UserManagementView />
      </div>
    </template>
  </OnboardingStepLayout>
</template>
