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
    const { suppressToastForCodes = [], toastOnSystemError = true } = options;
    isLoading.value = true;
    error.value = null;

    const timeoutPromise = new Promise((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        const err = new Error("Operation timed out");
        err.code = "TIMEOUT";
        reject(err);
      }, TIMEOUT_MS);
    });

    try {
      await Promise.race([actionFn(), timeoutPromise]);
      return true;
    } catch (err) {
      const uiError = normalizeError(err);
      error.value = uiError;

      if (toast && uiError) {
        const isSuppressed = suppressToastForCodes.includes(uiError.code);

        if (toastOnSystemError && uiError.isSystemError && !isSuppressed) {
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
