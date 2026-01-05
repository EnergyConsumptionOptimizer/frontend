<script setup>
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
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :style="{ width: '450px' }"
    header="User Details"
    modal
    class="p-fluid"
  >
    <form
      id="userForm"
      @submit.prevent="emit('save')"
      class="flex flex-col gap-4"
    >
      <div>
        <label for="username" class="font-bold block mb-2">Username</label>
        <InputText
          id="username"
          v-model.trim="user.username"
          required
          autofocus
          :invalid="submitted && !user.username"
          aria-describedby="username-error"
          fluid
        />
        <small
          v-if="submitted && !user.username"
          id="username-error"
          class="text-red-500"
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
