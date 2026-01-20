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
import { useLayout } from "@/layout/composables/useLayout";

const route = useRoute();
const confirm = useConfirm();
const { toggleDarkMode, isDarkTheme } = useLayout();

const loading = ref(false);
const storesMounted = ref(false);
const mobileMenuOpen = ref(false);

const onboardingStore = useOnboardingStore();
const authStore = useAuthStore();

let userStore = null;
let interactiveMapStore = null;
let thresholdStore = null;

const step = computed(() => route.meta.step ?? 1);
const canProceed = computed(() => onboardingStore.isStepCompleted(step.value));

const userMenuExpanded = computed(() => mobileMenuOpen.value);

const themeToggleLabel = computed(() =>
  isDarkTheme.value ? "Switch to Light Mode" : "Switch to Dark Mode",
);

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function closeMobileMenu() {
  mobileMenuOpen.value = false;
}

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

  console.log("[completeOnboarding] Starting sync process");

  const mapSuccess = await interactiveMapStore.syncAndFinalize();
  console.log("[completeOnboarding] mapSuccess:", mapSuccess);

  if (!mapSuccess) {
    loading.value = false;
    return;
  }

  const userSuccess = await userStore.syncAndFinalize();
  console.log("[completeOnboarding] userSuccess:", userSuccess);

  const thresholdSuccess = await thresholdStore.syncAndFinalize();
  console.log("[completeOnboarding] thresholdSuccess:", thresholdSuccess);

  if (userSuccess && thresholdSuccess) {
    console.log("[completeOnboarding] All syncs successful, redirecting");
    await finalizeAndRedirect();
    loading.value = false;
    return;
  }

  let errorDetail;
  if (!userSuccess && !thresholdSuccess) {
    errorDetail = "Users and Thresholds";
  } else if (!userSuccess) {
    errorDetail = "Household Users";
  } else {
    errorDetail = "Thresholds";
  }

  console.log("[completeOnboarding] Showing error dialog:", errorDetail);

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
  <div class="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950">
    <header class="layout-topbar" role="banner">
      <div class="layout-topbar-logo-container">
        <div class="layout-topbar-logo">
          <span class="font-semibold whitespace-nowrap">Welcome to E.C.O.</span>
        </div>
      </div>
      <div class="layout-topbar-actions">
        <button
          class="layout-topbar-menu-button layout-topbar-action lg:hidden"
          type="button"
          aria-label="Open user menu"
          :aria-expanded="userMenuExpanded"
          aria-controls="onboarding-user-menu"
          @click="toggleMobileMenu"
        >
          <i class="pi pi-ellipsis-v" aria-hidden="true"></i>
        </button>

        <!-- Desktop/Mobile menu -->
        <nav
          id="onboarding-user-menu"
          :class="[
            'layout-topbar-menu',
            'hidden lg:block',
            {
              'absolute right-8 top-16 bg-surface-0 dark:bg-surface-900 shadow-lg rounded-lg border border-surface-200 dark:border-surface-700 p-4 z-50 min-w-48':
                mobileMenuOpen,
              block: mobileMenuOpen,
            },
          ]"
          aria-label="User menu"
        >
          <!-- Click outside handler for mobile -->
          <div
            v-if="mobileMenuOpen"
            class="fixed inset-0 z-40 lg:hidden"
            @click="closeMobileMenu"
            aria-hidden="true"
          ></div>

          <div class="layout-topbar-menu-content relative z-50">
            <button
              type="button"
              class="layout-topbar-action w-full lg:w-auto"
              @click="toggleDarkMode"
              :aria-label="themeToggleLabel"
            >
              <i
                :class="['pi', isDarkTheme ? 'pi-moon' : 'pi-sun']"
                aria-hidden="true"
              ></i>
              <span class="ml-2 lg:hidden">
                {{ isDarkTheme ? "Dark Mode" : "Light Mode" }}
              </span>
            </button>

            <button
              type="button"
              class="layout-topbar-action w-full lg:w-auto"
              @click="handleLogout"
              aria-label="Logout"
            >
              <i class="pi pi-sign-out" aria-hidden="true"></i>
              <span class="ml-2 lg:hidden">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </header>

    <main id="main-content" class="layout-main-container" tabindex="-1">
      <div class="layout-main">
        <div
          class="w-full max-w-[90%] lg:max-w-[85%] xl:max-w-7xl mx-auto space-y-6"
        >
          <section aria-label="Onboarding progress">
            <Card class="shadow-sm">
              <template #content>
                <Stepper :value="step" linear>
                  <StepList>
                    <Step
                      v-for="stepItem in onboardingStore.steps"
                      :key="stepItem.index"
                      :value="stepItem.index"
                    >
                      <span class="text-sm font-medium">{{
                        stepItem.label
                      }}</span>
                    </Step>
                  </StepList>
                </Stepper>
              </template>
            </Card>
          </section>

          <section class="flex-1" aria-label="Step content">
            <Card class="shadow-sm">
              <template #content>
                <div class="p-2 sm:p-4 lg:p-6">
                  <router-view />
                </div>
              </template>
            </Card>
          </section>

          <nav aria-label="Step navigation">
            <Card class="shadow-sm">
              <template #content>
                <div
                  class="flex flex-col sm:flex-row justify-between gap-3 p-2"
                >
                  <div class="order-2 sm:order-1">
                    <Button
                      v-if="onboardingStore.hasPreviousStep(step)"
                      label="Back"
                      :loading="loading"
                      severity="secondary"
                      outlined
                      icon="pi pi-arrow-left"
                      class="w-full sm:w-auto min-h-11"
                      @click="goToPreviousStep"
                      :aria-label="`Go to previous step: ${onboardingStore.steps[step - 2]?.label}`"
                    />
                  </div>

                  <div class="order-1 sm:order-2">
                    <Button
                      v-if="onboardingStore.hasNextStep(step)"
                      label="Next"
                      :loading="loading"
                      :disabled="!canProceed"
                      icon="pi pi-arrow-right"
                      iconPos="right"
                      class="w-full sm:w-auto min-h-11"
                      @click="goToNextStep"
                      :aria-label="`Go to next step: ${onboardingStore.steps[step]?.label}`"
                    />
                    <Button
                      v-else
                      label="Complete"
                      :loading="loading"
                      :disabled="!canProceed"
                      severity="success"
                      icon="pi pi-check"
                      iconPos="right"
                      class="w-full sm:w-auto min-h-11"
                      @click="completeOnboarding"
                      aria-label="Complete onboarding and go to dashboard"
                    />
                  </div>
                </div>
              </template>
            </Card>
          </nav>
        </div>
      </div>
    </main>

    <Toast />
    <ConfirmDialog />
  </div>
</template>
