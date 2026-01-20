<script setup>
import { useOnboardingStore } from "@/stores/onboarding";
import { computed, onMounted, ref } from "vue";
import OnboardingStepLayout from "@/layout/OnboardingStepLayout.vue";
import { useInteractiveMapStore } from "@/stores/interactiveMapStore.js";
import InteractiveMapLayout from "@/layout/InteractiveMapLayout.vue";

const onboardingStore = useOnboardingStore();
const interactiveMapStore = useInteractiveMapStore();

const showWarningDialog = ref(false);

const warningBeforeReupload = computed(() => {
  return (
    interactiveMapStore.hasZones || interactiveMapStore.hasSmartFurnitureHookups
  );
});

function onFileSelect(event) {
  const file = event.files[0];

  if (file && file.type === "image/svg+xml") {
    const reader = new FileReader();

    reader.onload = async (e) => {
      await interactiveMapStore.uploadSvg(e.target.result, file.name);
    };

    onboardingStore.completeStep();
    reader.readAsText(file);
  }
}

function reuploadFloorPlan(event) {
  interactiveMapStore.resetMap();
  onboardingStore.reset();
  showWarningDialog.value = false;

  onFileSelect(event);
}

onMounted(async () => {
  interactiveMapStore.setLocalMode(true);
});
</script>

<template>
  <OnboardingStepLayout
    title="Upload floor plan file"
    subtitle="Please upload an SVG file of your floor plan"
  >
    <template #content>
      <div class="w-full max-w-2xl mx-auto">
        <div
          class="border-2 border-dashed border-surface-300 dark:border-surface-700 rounded-lg overflow-hidden"
          role="region"
          aria-label="Floor plan upload"
        >
          <div
            :class="[
              'p-4 sm:p-6',
              interactiveMapStore.svgData
                ? 'border-b-2 border-surface-300 dark:border-surface-700'
                : '',
            ]"
          >
            <FileUpload
              v-if="!interactiveMapStore.svgData || !warningBeforeReupload"
              mode="basic"
              @select="onFileSelect"
              customUpload
              auto
              accept=".svg"
              severity="secondary"
              class="w-full"
              :chooseLabel="interactiveMapStore.svgData ? 'Change' : 'Upload'"
              chooseIcon="pi pi-upload"
              :pt="{
                chooseButton: {
                  class: 'w-full sm:w-auto min-h-11',
                },
              }"
              aria-label="Upload SVG floor plan file"
            />
            <Button
              v-else
              label="Change"
              severity="secondary"
              outlined
              icon="pi pi-upload"
              class="w-full sm:w-auto min-h-11"
              @click="showWarningDialog = true"
              aria-label="Change floor plan (will delete existing zones and hookups)"
            />
          </div>

          <!-- Preview Area -->
          <div v-if="interactiveMapStore.svgData" class="p-4 sm:p-6 space-y-4">
            <!-- SVG Preview -->
            <div
              class="w-full bg-surface-0 dark:bg-surface-950 rounded border border-surface-200 dark:border-surface-700 overflow-hidden"
              style="min-height: 300px; max-height: 500px"
              role="img"
              :aria-label="`Floor plan preview: ${interactiveMapStore.svgFileName}`"
            >
              <InteractiveMapLayout
                :floor-plan-svg="interactiveMapStore.svgData"
              />
            </div>

            <!-- File Info -->
            <div
              class="text-sm sm:text-base text-surface-700 dark:text-surface-200"
            >
              <strong>Filename:</strong> {{ interactiveMapStore.svgFileName }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #dialogs>
      <Dialog
        v-model:visible="showWarningDialog"
        modal
        header="Reupload floor plan"
        :style="{ maxWidth: '500px' }"
        class="mx-4"
      >
        <div class="space-y-4">
          <p class="text-surface-600 dark:text-surface-300">
            Are you sure you want to reupload the floor plan? This will delete
            all the zones and the smart furniture hookups!
          </p>
        </div>

        <template #footer>
          <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              outlined
              class="w-full sm:w-auto min-h-11"
              @click="showWarningDialog = false"
            />
            <FileUpload
              mode="basic"
              @select="reuploadFloorPlan"
              customUpload
              auto
              accept=".svg"
              severity="danger"
              chooseLabel="Change"
              chooseIcon="pi pi-upload"
              :pt="{
                chooseButton: {
                  class: 'w-full sm:w-auto min-h-11',
                },
              }"
            />
          </div>
        </template>
      </Dialog>
    </template>
  </OnboardingStepLayout>
</template>
