<script setup>
import { useAuthStore } from "@/stores/auth";
import { reactive, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuthWrapper from "@/components/auth/AuthWrapper.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = reactive({
  username: "",
  password: "",
});

const status = reactive({
  loading: false,
  error: "",
});

const isFormInvalid = computed(() => !form.username || !form.password);

const handleLogin = async () => {
  status.error = "";
  if (isFormInvalid.value) return;

  status.loading = true;

  try {
    await authStore.login({
      username: form.username,
      password: form.password,
    });
    const redirectPath = route.query.redirect?.toString() || "/";
    await router.push(redirectPath);
  } catch (err) {
    handleLoginError(err);
  } finally {
    status.loading = false;
  }
};

const handleLoginError = (error) => {
  if (error.response?.status === 401) {
    status.error = "The username or password you entered is incorrect.";
  } else {
    status.error = "An unexpected error occurred. Please try again later.";
    console.error("Login Error:", error);
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
          v-model="form.username"
          placeholder="Username"
          class="w-full"
          :invalid="!!status.error"
          autocomplete="username"
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
          v-model="form.password"
          placeholder="Password"
          :toggleMask="true"
          :feedback="false"
          :invalid="!!status.error"
          autocomplete="current-password"
          fluid
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

      <div
        v-if="status.error"
        class="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-center"
      >
        {{ status.error }}
      </div>

      <Button
        label="Log In"
        type="submit"
        :loading="status.loading"
        :disabled="status.loading || isFormInvalid"
        class="w-full"
      />
    </form>
  </AuthWrapper>
</template>
