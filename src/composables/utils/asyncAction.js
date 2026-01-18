import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { normalizeError } from "@/utils/errorParser.js";
import { errorToast } from "@/utils/ui/toastPresets.js";

const TIMEOUT_MS = 10000;

export function useAsyncAction() {
  const isLoading = ref(false);
  const error = ref(null);
  const toast = useToast();

  const perform = async (actionFn, options = {}) => {
    const { suppressToastForCodes = [] } = options;

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
      let uiError;

      if (err.message === "Operation timed out") {
        uiError = {
          code: "TIMEOUT",
          summary: "Timeout",
          detail: "The server took too long to respond",
          status: 408,
          fields: null,
        };
      } else {
        uiError = normalizeError(err);
      }

      error.value = uiError;

      if (uiError && toast) {
        const shouldSuppress = suppressToastForCodes.includes(uiError.code);

        if (!shouldSuppress) {
          toast.add(errorToast(uiError.summary, uiError.detail));
        }
      }

      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, error, perform };
}
