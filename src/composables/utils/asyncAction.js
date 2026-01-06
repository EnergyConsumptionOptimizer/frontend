import { ref } from "vue";

export function useAsyncAction() {
  const isLoading = ref(false);
  const error = ref(null);

  /**
   * Executes an async action with automatic loading and error state management.
   * @param {Function} actionFn - The async function to run.
   * @returns {Promise<boolean>} - True if successful, False otherwise.
   */
  const perform = async (actionFn) => {
    isLoading.value = true;
    error.value = null;
    try {
      await actionFn();
      return true;
    } catch (err) {
      console.error("Action failed:", err);
      error.value = err;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, error, perform };
}
