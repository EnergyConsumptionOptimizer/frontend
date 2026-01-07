<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useOnboardingStore } from "@/stores/onboarding";
import OnboardingStepLayout from "@/layout/OnboardingStepLayout.vue";
import UserManagementView from "@/components/users/UserManagementView.vue";

const userStore = useUserStore();
const onboardingStore = useOnboardingStore();

onMounted(() => {
  userStore.setLocalMode(true);
  userStore.fetchUsers();
  onboardingStore.completeStep();
});
</script>

<template>
  <onboarding-step-layout
    title="Household Users"
    subtitle="Add users that live in the house"
  >
    <template #content>
      <div class="w-full mt-4">
        <UserManagementView :is-local-mode="true" />
      </div>
    </template>
  </onboarding-step-layout>
</template>
