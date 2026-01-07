<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
  router.push("/");
};

const goBack = () => {
  router.go(-1);
};
</script>

<template>
  <div
    class="relative min-h-screen w-full overflow-hidden bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center p-4"
  >
    <div
      class="absolute select-none opacity-15 dark:opacity-[0.05] font-black text-[15rem] sm:text-[20rem] text-surface-900 dark:text-surface-0 transform -rotate-12 z-0 pointer-events-none"
    >
      404
    </div>

    <div class="z-10 text-center relative max-w-lg w-full">
      <div class="mb-6 inline-flex animate-bounce">
        <div
          class="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-full ring-2 ring-primary-100 dark:ring-primary-900"
        >
          <i
            class="pi pi-compass text-4xl text-primary-500 dark:text-primary-400"
          ></i>
        </div>
      </div>

      <h1
        class="text-4xl sm:text-5xl font-bold text-surface-900 dark:text-surface-0 mb-3"
      >
        Page Not Found
      </h1>

      <p
        class="text-lg text-surface-600 dark:text-surface-400 mb-8 leading-relaxed"
      >
        Oh no! The resource you were looking for doesn't exist. It might have
        been moved or deleted.
      </p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          label="Go Back"
          icon="pi pi-arrow-left"
          outlined
          class="w-full sm:w-auto"
          @click="goBack"
        />
        <Button
          label="Go to Dashboard"
          icon="pi pi-home"
          class="w-full sm:w-auto"
          @click="goHome"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-surface-50 {
  background-image: radial-gradient(
    circle at center,
    var(--surface-200) 0%,
    var(--surface-100) 100%
  );
}
:global(.dark) .bg-surface-950 {
  background-image: radial-gradient(
    circle at center,
    var(--surface-900) 0%,
    var(--surface-950) 100%
  );
}
</style>
