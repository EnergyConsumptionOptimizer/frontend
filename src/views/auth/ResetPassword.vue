<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AuthWrapper from "@/components/auth/AuthWrapper.vue";

const router = useRouter();
const authStore = useAuthStore();

const resetCode = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const codeError = ref(false);

const passwordsMatch = computed(() => {
  if (!newPassword.value || !confirmPassword.value) return true;
  return newPassword.value === confirmPassword.value;
});

const isValid = computed(() => {
  return resetCode.value && newPassword.value && passwordsMatch.value;
});

const handleSubmit = async () => {
  if (!isValid.value) return;
  codeError.value = false;

  const success = await authStore.resetPassword(
    resetCode.value,
    newPassword.value,
  );

  if (success) {
    router.push({ name: "login" });
  } else {
    codeError.value = true;
  }
};

const handleCancel = () => {
  router.push({ name: "login" });
};
</script>

<template>
  <AuthWrapper
    title="Reset Admin Password"
    subtitle="Enter your code and new password"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
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
          :invalid="codeError"
          @input="codeError = false"
        />
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
          fluid
        />

        <small v-if="!passwordsMatch" class="text-red-500 block mt-1">
          Passwords do not match
        </small>

        <small v-if="codeError" class="text-red-500 block mt-2 font-medium">
          Invalid reset code.
        </small>
      </div>

      <div class="flex gap-4 pt-2">
        <Button label="Cancel" text @click="handleCancel" class="w-full" />
        <Button
          label="Confirm"
          type="submit"
          :loading="authStore.isLoading"
          :disabled="!isValid"
          class="w-full"
        />
      </div>
    </form>
  </AuthWrapper>
</template>
