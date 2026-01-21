<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/userStore";
import { useUniqueFieldValidation } from "@/composables/common/useUniqueFieldValidation.js";
import { useServerFormErrors } from "@/composables/useServerFormErrors";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Message from "primevue/message";

defineProps({
  loading: { type: Boolean, default: false },
});

const user = defineModel("user", { required: true });
const visible = defineModel("visible", { type: Boolean, default: false });
const emit = defineEmits(["save", "cancel"]);

const userStore = useUserStore();
const { users, error } = storeToRefs(userStore);
const { getFieldError: getServerError, globalError } =
  useServerFormErrors(error);

const submitted = ref(false);
const newPassword = ref("");
const confirmPassword = ref("");

const usernameRef = computed(() => user.value?.username);
const userIdRef = computed(() => user.value?.id);

const { validationError: localValidationError, isValid: isNameUnique } =
  useUniqueFieldValidation(usernameRef, users, userIdRef, "username");

const usernameError = computed(
  () => getServerError("username") || localValidationError.value,
);

const passwordsMatch = computed(
  () => !confirmPassword.value || newPassword.value === confirmPassword.value,
);

const isFormValid = computed(() => {
  const hasUsername = !!user.value?.username?.trim();
  const usernameValid = hasUsername && isNameUnique.value;

  const hasNewPassword = !!newPassword.value?.trim();
  const hasConfirmPassword = !!confirmPassword.value?.trim();
  const passwordValid =
    hasNewPassword && hasConfirmPassword && passwordsMatch.value;

  return usernameValid || passwordValid;
});

watch(visible, (isOpen) => {
  if (isOpen) {
    submitted.value = false;
    newPassword.value = "";
    confirmPassword.value = "";
    if (userStore.error) userStore.clearError();
  }
});

function onSave() {
  submitted.value = true;
  if (!isFormValid.value) return;

  const payload = {
    id: user.value.id,
    username: user.value?.username?.trim() || undefined,
    password: newPassword.value?.trim() || undefined,
    role: user.value.role,
  };

  emit("save", payload);
}

const dialogTitle = computed(() =>
  user.value?.id ? "Edit Profile" : "New User",
);
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="dialogTitle"
    modal
    class="w-full max-w-md mx-4"
    @hide="emit('cancel')"
  >
    <form
      id="user-form"
      @submit.prevent="onSave"
      class="flex flex-col gap-6"
      novalidate
      aria-label="User form"
    >
      <Message
        v-if="globalError"
        severity="error"
        variant="simple"
        class="mb-2"
        role="alert"
        aria-live="assertive"
      >
        {{ globalError }}
      </Message>

      <div class="flex flex-col gap-2">
        <label for="username" class="font-semibold text-base">Username</label>
        <InputText
          id="username"
          v-model.trim="user.username"
          autofocus
          class="w-full min-h-11"
          :invalid="!!usernameError"
          :aria-invalid="!!usernameError"
          aria-describedby="username-error"
          placeholder="Enter username"
          fluid
        />
        <Message
          id="username-error"
          v-if="usernameError"
          severity="error"
          variant="simple"
          size="small"
          role="alert"
          aria-live="polite"
        >
          {{ usernameError }}
        </Message>
      </div>

      <div class="flex flex-col gap-2">
        <label for="new-password" class="font-semibold text-base"
          >New Password</label
        >
        <Password
          id="new-password"
          v-model.trim="newPassword"
          toggleMask
          :feedback="false"
          class="w-full"
          inputClass="w-full min-h-11"
          fluid
          placeholder="Enter new password"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="confirm-password" class="font-semibold text-base"
          >Confirm Password</label
        >
        <Password
          id="confirm-password"
          v-model.trim="confirmPassword"
          toggleMask
          :feedback="false"
          class="w-full"
          inputClass="w-full min-h-11"
          :invalid="!passwordsMatch"
          :aria-invalid="!passwordsMatch"
          aria-describedby="password-match-error"
          fluid
          placeholder="Confirm new password"
        />
        <Message
          id="password-match-error"
          v-if="!passwordsMatch"
          severity="error"
          variant="simple"
          size="small"
          role="alert"
          aria-live="polite"
        >
          Passwords do not match.
        </Message>
      </div>
    </form>

    <template #footer>
      <div class="flex flex-col sm:flex-row justify-end gap-3">
        <Button
          label="Cancel"
          icon="pi pi-times"
          severity="secondary"
          outlined
          type="button"
          class="min-h-11 w-full sm:w-auto"
          aria-label="Cancel user editing"
          @click="emit('cancel')"
        />
        <Button
          label="Save"
          icon="pi pi-check"
          type="submit"
          form="user-form"
          class="min-h-11 w-full sm:w-auto"
          :loading="loading"
          :disabled="!isFormValid || loading"
          :aria-label="user?.id ? 'Save changes' : 'Create new user'"
        />
      </div>
    </template>
  </Dialog>
</template>
