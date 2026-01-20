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

const usernameRef = computed(() => user.value?.username);
const userIdRef = computed(() => user.value?.id);

const { validationError: localValidationError, isValid: isNameUnique } =
  useUniqueFieldValidation(usernameRef, users, userIdRef, "username");

const usernameError = computed(
  () => getServerError("username") || localValidationError.value,
);

const isFormValid = computed(() => {
  const hasUsername = !!user.value?.username?.trim();
  const isUnique = isNameUnique.value;
  const isPasswordValid = !!user.value?.id || !!user.value?.password?.trim();
  return hasUsername && isUnique && isPasswordValid;
});

watch(visible, (isOpen) => {
  if (isOpen) {
    submitted.value = false;
    if (userStore.error) userStore.clearError();
  }
});

function onSave() {
  submitted.value = true;
  if (!isFormValid.value) return;
  emit("save", {
    id: user.value.id,
    username: user.value.username.trim(),
    password: user.value.password,
    role: user.value.role,
  });
}

const dialogTitle = computed(() => (user.value?.id ? "Edit User" : "New User"));
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
        <label for="username" class="font-semibold text-base">
          Username <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <InputText
          id="username"
          v-model.trim="user.username"
          required
          autofocus
          class="w-full min-h-11"
          :invalid="!!usernameError || (submitted && !user.username)"
          :aria-invalid="!!usernameError || (submitted && !user.username)"
          aria-describedby="username-error"
          aria-required="true"
          placeholder="Enter username"
          fluid
          @input="clearError"
        />
        <Message
          id="username-error"
          v-if="usernameError || (submitted && !user.username)"
          severity="error"
          variant="simple"
          size="small"
          role="alert"
          aria-live="polite"
        >
          {{ usernameError || "Username is required." }}
        </Message>
      </div>

      <div v-if="!user.id" class="flex flex-col gap-2">
        <label for="password" class="font-semibold text-base">
          Password <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <Password
          id="password"
          v-model.trim="user.password"
          toggleMask
          :feedback="false"
          class="w-full"
          inputClass="w-full min-h-11"
          :invalid="submitted && !user.password"
          :aria-invalid="submitted && !user.password"
          aria-describedby="password-error"
          fluid
          aria-required="true"
          placeholder="Enter password"
          @input="clearError"
        />
        <Message
          id="password-error"
          v-if="submitted && !user.password"
          severity="error"
          variant="simple"
          size="small"
          role="alert"
          aria-live="polite"
        >
          Password is required.
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
          :disabled="loading"
          :aria-label="user?.id ? 'Save user changes' : 'Create new user'"
        />
      </div>
    </template>
  </Dialog>
</template>
