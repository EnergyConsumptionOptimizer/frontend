<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import AuthWrapper from "@/components/auth/AuthWrapper.vue";

const router = useRouter();
const authStore = useAuthStore();
const { isLoading } = storeToRefs(authStore);

const resetCode = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const error = ref("");

const isValid = computed(() => {
  return (
    resetCode.value &&
    newPassword.value &&
    newPassword.value === confirmPassword.value
  );
});

const handleSubmit = async () => {
  if (!isValid.value) return;
  error.value = "";

  try {
    await authStore.resetPassword(resetCode.value, newPassword.value);
    router.push({ name: "login" });
  } catch (err) {
    error.value =
      err.response?.data?.message || err.message || "Failed to reset password";
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
          fluid
        />
        <small
          v-if="
            newPassword && confirmPassword && newPassword !== confirmPassword
          "
          class="text-red-500 block mt-1"
        >
          Passwords do not match
        </small>
      </div>

      <div
        v-if="error"
        class="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-center"
      >
        {{ error }}
      </div>

      <div class="flex gap-4">
        <Button label="Cancel" text @click="handleCancel" class="w-full" />
        <Button
          label="Confirm"
          type="submit"
          :loading="isLoading"
          :disabled="!isValid"
          class="w-full"
        />
      </div>
    </form>
  </AuthWrapper>
</template>
