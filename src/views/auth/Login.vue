<script setup>
import { ref, computed, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/authsStore.js";
import { useServerFormErrors } from "@/composables/useServerFormErrors";
import AuthWrapper from "@/components/auth/AuthWrapper.vue";
import Message from "primevue/message";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { error } = storeToRefs(authStore);

const { globalError } = useServerFormErrors(error);

const username = ref("");
const password = ref("");

const isFormInvalid = computed(() => !username.value || !password.value);

const handleLogin = async () => {
  if (isFormInvalid.value) return;

  const success = await authStore.login({
    username: username.value,
    password: password.value,
  });

  if (success) {
    const redirectPath = route.query.redirect?.toString() || "/";
    await router.push(redirectPath);
  }
};

const clearError = () => {
  if (error.value) error.value = null;
};

onUnmounted(clearError);
</script>

<template>
  <AuthWrapper
    title="Energy Consumption Optimizer"
    subtitle="Log in to continue"
  >
    <form
      @submit.prevent="handleLogin"
      class="space-y-4 sm:space-y-6"
      novalidate
    >
      <Message
        v-if="globalError"
        severity="error"
        variant="simple"
        class="mb-4 w-full justify-center"
      >
        {{ globalError }}
      </Message>

      <div class="space-y-2">
        <label
          for="username"
          class="block text-base sm:text-xl font-medium text-surface-900 dark:text-surface-0"
        >
          Username
        </label>
        <InputText
          id="username"
          v-model="username"
          placeholder="Enter your username"
          class="w-full min-h-11"
          :invalid="!!globalError"
          autocomplete="username"
          @input="clearError"
        />
      </div>

      <div class="space-y-2">
        <label
          for="password"
          class="block text-base sm:text-xl font-medium text-surface-900 dark:text-surface-0"
        >
          Password
        </label>
        <Password
          inputId="password"
          v-model="password"
          placeholder="Enter your password"
          toggleMask
          :feedback="false"
          :invalid="!!globalError"
          autocomplete="current-password"
          fluid
          @input="clearError"
        />
      </div>

      <div class="text-right">
        <router-link
          to="/reset-password"
          class="text-sm sm:text-base text-primary font-medium hover:underline"
        >
          Reset admin password
        </router-link>
      </div>

      <Button
        label="Log In"
        type="submit"
        class="w-full min-h-11"
        :loading="authStore.isLoading"
        :disabled="authStore.isLoading || isFormInvalid"
      />
    </form>
  </AuthWrapper>
</template>
