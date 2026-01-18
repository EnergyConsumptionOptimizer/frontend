import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { normalizeError } from "@/utils/errorParser.js";
import { errorToast } from "@/utils/ui/toastPresets.js";

const TIMEOUT_MS = 10000;

export function useAsyncAction() {
  const isLoading = ref(false);
  const error = ref(null);
  const toast = useToast();

  const perform = async (actionFn) => {
    isLoading.value = true;
    error.value = null;

    const timeoutPromise = new Promise((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error("Operation timed out"));
      }, TIMEOUT_MS);
    });

    try {
      await Promise.race([actionFn(), timeoutPromise]);
      return true;
    } catch (err) {
      error.value = err;

      let uiError;
      if (err.message === "Operation timed out") {
        uiError = {
          summary: "Timeout",
          detail: "The server took too long to respond",
        };
      } else {
        uiError = normalizeError(err);
      }

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
