<script setup>
import { useAuthStore } from "@/stores/auth";
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuthWrapper from "@/components/auth/AuthWrapper.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const username = ref("");
const password = ref("");

const loginFailed = ref(false);

const isFormInvalid = computed(() => !username.value || !password.value);

const handleLogin = async () => {
  loginFailed.value = false;
  if (isFormInvalid.value) return;

  const success = await authStore.login({
    username: username.value,
    password: password.value,
  });

  if (success) {
    const redirectPath = route.query.redirect?.toString() || "/";
    await router.push(redirectPath);
  } else {
    if (authStore.error?.response?.status === 401) {
      loginFailed.value = true;
    } else {
      console.error("Login unexpected error:", authStore.error);
      loginFailed.value = true;
    }
  }
};
</script>

<template>
  <AuthWrapper
    title="Energy Consumption Optimizer"
    subtitle="Log in to continue"
  >
    <form @submit.prevent="handleLogin" class="space-y-6">
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
          :invalid="loginFailed"
          autocomplete="username"
          @input="loginFailed = false"
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
          :invalid="loginFailed"
          autocomplete="current-password"
          fluid
          @input="loginFailed = false"
        />

        <small v-if="loginFailed" class="text-red-500 block mt-2 font-medium">
          Invalid username or password.
        </small>
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
