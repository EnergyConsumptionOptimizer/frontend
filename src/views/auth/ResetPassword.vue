<script setup>
import { ref, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/authsStore.js";
import { useServerFormErrors } from "@/composables/useServerFormErrors";
import AuthWrapper from "@/components/auth/AuthWrapper.vue";
import Message from "primevue/message";

const router = useRouter();
const authStore = useAuthStore();
const { error } = storeToRefs(authStore);

const { getError: getServerError, genericError } = useServerFormErrors(error);

const resetCode = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const passwordsMatch = computed(() => {
  if (!newPassword.value || !confirmPassword.value) return true;
  return newPassword.value === confirmPassword.value;
});

const isValid = computed(() => {
  return (
    resetCode.value?.trim() &&
    newPassword.value &&
    confirmPassword.value &&
    newPassword.value === confirmPassword.value
  );
});

const codeError = computed(() => getServerError("resetCode"));

const handleSubmit = async () => {
  if (!isValid.value) return;

  const success = await authStore.resetPassword(
    resetCode.value,
    newPassword.value,
  );

  if (success) {
    router.push({ name: "login" });
  }
};

const handleCancel = () => {
  router.push({ name: "login" });
};

const clearError = () => {
  if (authStore.error) authStore.error = null;
};

onUnmounted(() => {
  clearError();
});
</script>

<template>
  <AuthWrapper
    title="Reset Admin Password"
    subtitle="Enter your code and new password"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6" novalidate>
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
          for="resetCode"
          class="block text-xl font-medium mb-2 text-surface-900 dark:text-surface-0"
        >
          Reset Code
        </label>
        <InputText
          id="resetCode"
          v-model="resetCode"
          placeholder="Reset Code"
          class="w-full"
          :invalid="!!codeError"
          aria-describedby="code-error"
          @input="clearError"
        />
        <Message
          id="code-error"
          v-if="codeError"
          severity="error"
          variant="simple"
          size="small"
          class="mt-2"
        >
          {{ codeError }}
        </Message>
      </div>

      <div>
        <label
          for="newPassword"
          class="block text-xl font-medium mb-2 text-surface-900 dark:text-surface-0"
        >
          New Password
        </label>
        <Password
          inputId="newPassword"
          v-model="newPassword"
          placeholder="New Password"
          :toggleMask="true"
          :feedback="false"
          fluid
        />
      </div>

      <div>
        <label
          for="confirmPassword"
          class="block text-xl font-medium mb-2 text-surface-900 dark:text-surface-0"
        >
          Confirm Password
        </label>
        <Password
          inputId="confirmPassword"
          v-model="confirmPassword"
          placeholder="Confirm Password"
          :toggleMask="true"
          :feedback="false"
          :invalid="!passwordsMatch"
          aria-describedby="match-error"
          fluid
        />

        <Message
          id="match-error"
          v-if="!passwordsMatch"
          severity="error"
          variant="simple"
          size="small"
          class="mt-1"
        >
          Passwords do not match
        </Message>
      </div>

      <div class="flex gap-4 pt-2">
        <Button
          label="Cancel"
          text
          type="button"
          @click="handleCancel"
          class="w-full"
        />
        <Button
          label="Confirm"
          type="submit"
          :loading="authStore.isLoading"
          :disabled="authStore.isLoading || !isValid"
          class="w-full"
        />
      </div>
    </form>
  </AuthWrapper>
</template>
