import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { normalizeError } from "@/utils/errorParser.js";
import { errorToast } from "@/utils/ui/toastPresets.js";

export function useAsyncAction() {
  const isLoading = ref(false);
  const error = ref(null);
  const toast = useToast();

  const perform = async (actionFn) => {
    isLoading.value = true;
    error.value = null;

    try {
      await actionFn();
      return true;
    } catch (err) {
      console.error("Async Operation Failed:", err);
      error.value = err;
      const uiError = normalizeError(err);
      if (uiError && toast) {
        toast.add(errorToast(uiError.summary, uiError.detail));
      }

      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, error, perform };
}
