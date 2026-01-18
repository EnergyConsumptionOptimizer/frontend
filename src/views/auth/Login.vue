<script setup>
import { useAuthStore } from "@/stores/authsStore.js";
import { ref, computed, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useServerFormErrors } from "@/composables/useServerFormErrors";
import AuthWrapper from "@/components/auth/AuthWrapper.vue";
import Message from "primevue/message";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { error } = storeToRefs(authStore);

const { genericError } = useServerFormErrors(error);

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
  if (authStore.error) authStore.error = null;
};

// PULIZIA: Quando lasciamo la pagina di login (es. andiamo a Reset Password), resettiamo gli errori.
onUnmounted(() => {
  clearError();
});
</script>

<template>
  <AuthWrapper
    title="Energy Consumption Optimizer"
    subtitle="Log in to continue"
  >
    <form @submit.prevent="handleLogin" class="space-y-6" novalidate>
      <Message
        v-if="genericError"
        severity="error"
        variant="simple"
        class="mb-4 w-full justify-center"
      >
        {{ genericError }}
      </Message>

      <div>
        <label
          for="username"
          class="block text-xl font-medium mb-2 text-surface-900 dark:text-surface-0"
        >
          Username
        </label>
        <InputText
          id="username"
          v-model="username"
          placeholder="Username"
          class="w-full"
          :invalid="!!genericError"
          autocomplete="username"
          @input="clearError"
        />
      </div>

      <div>
        <label
          for="password"
          class="block text-xl font-medium mb-2 text-surface-900 dark:text-surface-0"
        >
          Password
        </label>
        <Password
          inputId="password"
          v-model="password"
          placeholder="Password"
          :toggleMask="true"
          :feedback="false"
          :invalid="!!genericError"
          autocomplete="current-password"
          fluid
          @input="clearError"
        />
      </div>

      <div class="text-right">
        <router-link
          to="/reset-password"
          class="text-primary font-medium cursor-pointer hover:underline"
        >
          Reset admin password
        </router-link>
      </div>

      <Button
        label="Log In"
        type="submit"
        :loading="authStore.isLoading"
        :disabled="authStore.isLoading || isFormInvalid"
        class="w-full"
      />
    </form>
  </AuthWrapper>
</template>
