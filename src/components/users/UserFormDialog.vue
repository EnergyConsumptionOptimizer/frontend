<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/userStore";
import { useNameValidation } from "@/composables/common/useNameValidation";

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
const { users } = storeToRefs(userStore);

const submitted = ref(false);

const usernameRef = computed(() => user.value?.username);
const userIdRef = computed(() => user.value?.id);

const { validationError, isValid: isNameUnique } = useNameValidation(
  usernameRef,
  users,
  userIdRef,
  "username",
);

const isFormValid = computed(() => {
  const hasUsername = !!user.value?.username?.trim();
  const isUnique = isNameUnique.value;
  const isPasswordValid = !!user.value?.id || !!user.value?.password?.trim();

  return hasUsername && isUnique && isPasswordValid;
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
    :style="{ width: '450px' }"
    :header="dialogTitle"
    modal
    class="p-fluid"
    @hide="emit('cancel')"
    @after-hide="submitted = false"
  >
    <form id="user-form" @submit.prevent="onSave" class="flex flex-col gap-4">
      <div class="field">
        <label for="username" class="font-bold block mb-2">Username</label>
        <InputText
          id="username"
          v-model.trim="user.username"
          required
          autofocus
          :invalid="!!validationError || (submitted && !user.username)"
          fluid
        />
        <Message
          v-if="validationError || (submitted && !user.username)"
          severity="error"
          variant="simple"
          size="small"
        >
          {{ validationError || "Username is required." }}
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
          fluid
        />
        <Message
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
      <Button label="Cancel" icon="pi pi-times" text @click="emit('cancel')" />
      <Button
        label="Save"
        icon="pi pi-check"
        type="submit"
        form="user-form"
        :loading="loading"
        :disabled="!isFormValid"
      />
    </template>
  </Dialog>
</template>
