import { defineStore } from "pinia";
import { ONBOARDING_STEPS } from "@/config/onboardingSteps.js";
import { MapService } from "@/service/MapService.js";

export const useOnboardingStore = defineStore("onboarding", {
  state: () => ({
    currentStep: 1,
    maxAccessibleStep: 1,
    completedSteps: [],
    steps: ONBOARDING_STEPS,
    isInitialized: false,
    isComplete: false,
  }),
  getters: {
    getCurrentStepIndex: (state) => {
      return state.currentStep > state.maxAccessibleStep
        ? state.maxAccessibleStep
        : state.currentStep;
    },
    totalSteps: (state) => state.steps.length,
    getStepByIndex: (state) => (index) => {
      return state.steps.find((step) => step.index === index);
    },
    getStepByPath: (state) => (path) => {
      return state.steps.find((step) => step.path === path);
    },
    getNameByStep: (state) => (stepIndex) => {
      const step = state.steps.find((s) => s.index === stepIndex);

      if (step && step.index <= state.maxAccessibleStep) {
        return step.name;
      }

      return state.steps[0].name;
    },
    getPathByStep: (state) => (stepIndex) => {
      const step = state.steps.find((s) => s.index === stepIndex);

      return step && step.index <= state.maxAccessibleStep ? step.path : null;
    },
    isStepCompleted: (state) => (stepIndex) => {
      return state.completedSteps.includes(stepIndex);
    },
    canAccessStep: (state) => (step) => {
      return step <= state.maxAccessibleStep;
    },
    previousStepPath: (state) => (currentStepIndex) => {
      const prevStep = state.steps.find(
        (s) => s.index === currentStepIndex - 1,
      );
      return prevStep ? prevStep.path : null;
    },
    nextStepPath: (state) => (currentStepIndex) => {
      const nextStep = state.steps.find(
        (s) => s.index === currentStepIndex + 1,
      );
      return nextStep ? nextStep.path : null;
    },
    hasPreviousStep: () => (currentStepIndex) => {
      return currentStepIndex > 1;
    },
    hasNextStep: (state) => (currentStepIndex) => {
      return currentStepIndex < state.steps.length;
    },
  },
  actions: {
    async init() {
      const status = localStorage.getItem("onboarding_status");

      if (status === "completed") {
        this.isComplete = true;
      } else {
        const fp = await MapService.getFloorPlan();
        this.isComplete = fp != null;
      }

      this.isInitialized = true;
    },
    reset() {
      this.maxAccessibleStep = 1;
      this.completedSteps = [];
    },
    setCurrentStep(step) {
      if (step <= this.maxAccessibleStep) {
        this.currentStep = step;
      } else this.currentStep = this.maxAccessibleStep;
    },
    completeStep() {
      if (!this.completedSteps.includes(this.currentStep)) {
        this.completedSteps.push(this.currentStep);
      }

      if (
        this.currentStep === this.maxAccessibleStep &&
        this.currentStep < this.steps.length
      ) {
        this.maxAccessibleStep = this.maxAccessibleStep + 1;
      }
    },
    uncompleteStep() {
      if (this.completedSteps.includes(this.currentStep)) {
        this.completedSteps = this.completedSteps.filter(
          (step) => step !== this.currentStep,
        );
      }

      this.maxAccessibleStep = this.currentStep;
    },
    finishOnboarding() {
      this.isComplete = true;
      localStorage.setItem("onboarding_status", "completed");
      localStorage.removeItem("shouldStoresPersist");
      this.reset();
    },
  },
  persist: {
    omit: ["isInitialized"],
  },
});
