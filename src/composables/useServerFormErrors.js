import { computed } from "vue";

/**
 * Composable for handling form errors from async operations
 * Provides a clean API to access field-specific and global error messages
 */
export function useServerFormErrors(errorRef) {
  /**
   * Check if a specific field has an error
   */
  const hasFieldError = (field) => {
    return !!errorRef.value?.fields?.[field];
  };

  /**
   * Get error message for a specific field
   */
  const getFieldError = (field) => {
    return errorRef.value?.fields?.[field] || "";
  };

  /**
   * Global error message (non-field-specific)
   * Returns the detail if there are no field errors, otherwise null
   */
  const globalError = computed(() => {
    if (!errorRef.value) return null;

    // If there are field-specific errors, don't show global message
    const hasFields =
      errorRef.value.fields && Object.keys(errorRef.value.fields).length > 0;

    if (hasFields) {
      return null;
    }

    return errorRef.value.detail || null;
  });

  /**
   * Check if there are any field-specific errors
   */
  const hasFieldErrors = computed(() => {
    return !!(
      errorRef.value?.fields && Object.keys(errorRef.value.fields).length > 0
    );
  });

  /**
   * Get all field errors as an object
   */
  const fieldErrors = computed(() => {
    return errorRef.value?.fields || {};
  });

  /**
   * Get the error code if available
   */
  const errorCode = computed(() => {
    return errorRef.value?.code || null;
  });

  /**
   * Get the error summary/title
   */
  const errorSummary = computed(() => {
    return errorRef.value?.summary || null;
  });

  return {
    hasFieldError,
    getFieldError,
    globalError,
    hasFieldErrors,
    fieldErrors,
    errorCode,
    errorSummary,
  };
}
