<script setup>
import { useAuthStore } from "@/stores/auth";
import { reactive, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

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
  <div
    class="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-900 p-4"
  >
    <div class="w-full max-w-md">
      <div
        class="bg-linear-to-b from-primary-400 to-primary-400 p-1 rounded-[56px]"
      >
        <div
          class="bg-surface-0 dark:bg-surface-900 rounded-[53px] p-8 sm:p-12"
        >
          <div class="text-center mb-8">
            <h1
              class="text-3xl font-medium text-surface-900 dark:text-surface-0 mb-2"
            >
              Energy Consumption Optimizer
            </h1>
            <p class="text-muted-color">Log in to continue</p>
          </div>

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
              <span
                class="text-primary font-medium cursor-pointer hover:underline"
              >
                Reset admin password
              </span>
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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-password .p-icon) {
  transform: scale(1.2);
  margin-right: 0.5rem;
}
</style>
