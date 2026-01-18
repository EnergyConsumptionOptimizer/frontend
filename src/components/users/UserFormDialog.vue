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
const { getError: getServerError, formGlobalError } =
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
    if (userStore.error) userStore.error = null;
  }
});

const clearError = () => {
  if (userStore.error) userStore.error = null;
};

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
    :style="{ width: '450px' }"
    :header="dialogTitle"
    modal
    class="p-fluid"
    @hide="emit('cancel')"
  >
    <form
      id="user-form"
      @submit.prevent="onSave"
      class="flex flex-col gap-4"
      novalidate
    >
      <Message
        v-if="formGlobalError"
        severity="error"
        variant="simple"
        class="mb-2"
      >
        {{ formGlobalError }}
      </Message>

      <div class="field">
        <label for="username" class="font-bold block mb-2">Username</label>
        <InputText
          id="username"
          v-model.trim="user.username"
          required
          autofocus
          :invalid="!!usernameError || (submitted && !user.username)"
          aria-describedby="username-error"
          fluid
          @input="clearError"
        />
        <Message
          id="username-error"
          v-if="usernameError || (submitted && !user.username)"
          severity="error"
          variant="simple"
          size="small"
        >
          {{ usernameError || "Username is required." }}
        </Message>
      </div>

      <div v-if="!user.id" class="field">
        <label for="password" class="font-bold block mb-2">Password</label>
        <Password
          id="password"
          v-model.trim="user.password"
          toggleMask
          :feedback="false"
          :invalid="submitted && !user.password"
          aria-describedby="password-error"
          fluid
          @input="clearError"
        />
        <Message
          id="password-error"
          v-if="submitted && !user.password"
          severity="error"
          variant="simple"
          size="small"
        >
          Password is required.
        </Message>
      </div>
    </form>

    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        text
        type="button"
        @click="emit('cancel')"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        type="submit"
        form="user-form"
        :loading="loading"
        :disabled="loading"
      />
    </template>
  </Dialog>
</template>
