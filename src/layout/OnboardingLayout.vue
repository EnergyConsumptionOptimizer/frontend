<script setup>
import { useOnboardingStore } from "@/stores/onboarding";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import router from "@/router/index.js";
import { useAuthStore } from "@/stores/authsStore.js";
import { useUserStore } from "@/stores/userStore";
import { useThresholdStore } from "@/stores/thresholdStore";
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";
import { useConfirm } from "primevue/useconfirm";

const route = useRoute();
const confirm = useConfirm();

const loading = ref(false);
const storesMounted = ref(false);

const onboardingStore = useOnboardingStore();

let userStore = null;
let interactiveMapStore = null;
let thresholdStore = null;

const step = computed(() => {
  return route.meta.step ?? 1;
});

const canProceed = computed(() => {
  return onboardingStore.isStepCompleted(step.value);
});

const authStore = useAuthStore();

function goToPreviousStep() {
  loading.value = true;
  const previousPath = onboardingStore.previousStepPath(step.value);
  if (previousPath) {
    router.push(`/onboarding/${previousPath}`).finally(() => {
      loading.value = false;
    });
  } else loading.value = false;
}

function goToNextStep() {
  loading.value = true;

  if (canProceed.value) {
    const nextPath = onboardingStore.nextStepPath(step.value);

    if (nextPath) {
      router.push(`/onboarding/${nextPath}`).finally(() => {
        loading.value = false;
      });
    } else loading.value = false;
  }
}

function mountStores() {
  if (!storesMounted.value) {
    userStore = useUserStore();
    interactiveMapStore = useInteractiveMapStore();
    thresholdStore = useThresholdStore();

    userStore.setLocalMode?.(true);
    interactiveMapStore.setLocalMode?.(true);
    thresholdStore.setLocalMode?.(true);

    storesMounted.value = true;
  }
}

async function finalizeAndRedirect() {
  onboardingStore.finishOnboarding();
  await router.push({ name: "dashboard" });
}

async function completeOnboarding() {
  loading.value = true;
  mountStores();

  const mapSuccess = await interactiveMapStore.syncAndFinalize();

  if (!mapSuccess) {
    loading.value = false;
    return;
  }

  const userSuccess = await userStore.syncAndFinalize();
  const thresholdSuccess = await thresholdStore.syncAndFinalize();

  if (userSuccess && thresholdSuccess) {
    await finalizeAndRedirect();
    loading.value = false;
    return;
  }

  let errorDetail = "";
  if (!userSuccess && !thresholdSuccess) {
    errorDetail = "Users and Thresholds";
  } else if (!userSuccess) {
    errorDetail = "Household Users";
  } else {
    errorDetail = "Thresholds";
  }

  confirm.require({
    header: "Setup Incomplete",
    message: `There was an error saving: ${errorDetail}. Do you want to proceed to the Dashboard anyway? You can configure them later manually.`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Yes, proceed",
    rejectLabel: "No, stay here",
    accept: async () => {
      await finalizeAndRedirect();
      loading.value = false;
    },
    reject: () => {
      loading.value = false;
    },
  });
}

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: "login" });
};

onMounted(() => {
  localStorage.setItem("shouldStoresPersist", "true");
});
</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container flex items-center gap-3">
      <div class="layout-topbar-logo flex items-center gap-2 no-underline">
        <span class="text-xl font-semibold whitespace-nowrap"
          >WELCOME TO E.C.O.</span
        >
      </div>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <button
            type="button"
            class="layout-topbar-action"
            @click="handleLogout"
          >
            <i class="pi pi-sign-out"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="layout-main-container content-center">
    <div class="layout-main space-y-6">
      <div class="flex justify-center w-full">
        <Card class="w-2/3">
          <template #content>
            <Stepper :value="step" class="basis-200" linear>
              <StepList>
                <Step
                  v-for="step in onboardingStore.steps"
                  :key="step.index"
                  :value="step.index"
                >
                  {{ step.label }}
                </Step>
              </StepList>
            </Stepper>
          </template>
        </Card>
      </div>
      <Card>
        <template #content>
          <router-view />
        </template>
      </Card>
    </div>
    <Card class="mb-4">
      <template #content>
        <div class="w-full flex justify-between">
          <div>
            <Button
              :loading="loading"
              v-if="onboardingStore.hasPreviousStep(step)"
              label="Back"
              @click="goToPreviousStep"
              severity="secondary"
              icon="pi pi-arrow-left"
            />
          </div>
          <div>
            <Button
              :loading="loading"
              v-if="onboardingStore.hasNextStep(step)"
              label="Next"
              @click="goToNextStep"
              :disabled="!canProceed"
              icon="pi pi-arrow-right"
              iconPos="right"
            />
            <Button
              :loading="loading"
              v-else
              label="Complete"
              icon="pi pi-arrow-right"
              iconPos="right"
              :disabled="!canProceed"
              @click="completeOnboarding"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
  <Toast />
  <ConfirmDialog />
</template>

<style scoped></style>
