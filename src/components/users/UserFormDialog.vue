<script setup>
import { computed, toRef } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useNameValidation } from "@/composables/common/useNameValidation";

const visible = defineModel("visible");
const user = defineModel("user", { required: true });

defineProps({
  submitted: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["save", "cancel"]);

const userStore = useUserStore();

const usernameRef = computed(() => user.value.username);
const userIdRef = computed(() => user.value.id);

const { validationError, isValid: isNameValid } = useNameValidation(
  usernameRef,
  toRef(userStore, "users"),
  userIdRef,
  "username",
);

const onSave = () => {
  if (isNameValid.value) {
    emit("save");
  }
};
</script>
<template>
  <Dialog
    v-model:visible="visible"
    :style="{ width: '450px' }"
    header="User Details"
    modal
    class="p-fluid"
  >
    <form id="userForm" @submit.prevent="onSave" class="flex flex-col gap-4">
      <div>
        <label for="username" class="font-bold block mb-2">Username</label>
        <InputText
          id="username"
          v-model.trim="user.username"
          required
          autofocus
          :invalid="!!validationError || (submitted && !user.username)"
          fluid
        />
        <small v-if="validationError" class="text-red-500 block mt-1">
          {{ validationError }}
        </small>
        <small
          v-else-if="submitted && !user.username"
          class="text-red-500 block mt-1"
        >
          Username is required.
        </small>
      </div>
      <div v-if="!user.id">
        <label for="password" class="font-bold block mb-2">Password</label>
        <Password
          id="password"
          v-model.trim="user.password"
          toggleMask
          :feedback="false"
          :invalid="submitted && !user.password"
          aria-describedby="password-error"
          fluid
        />
        <small
          v-if="submitted && !user.password"
          id="password-error"
          class="text-red-500"
        >
          Password is required.
        </small>
      </div>
    </form>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text @click="emit('cancel')" />
      <Button
        label="Save"
        icon="pi pi-check"
        type="submit"
        form="userForm"
        :loading="loading"
      />
    </template>
  </Dialog>
</template>
