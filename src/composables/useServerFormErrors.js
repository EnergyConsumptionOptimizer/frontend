import { computed } from "vue";

export function useServerFormErrors(errorRef) {
  const hasError = (field) => {
    return !!errorRef.value?.fields?.[field];
  };

  const getError = (field) => {
    return errorRef.value?.fields?.[field] || "";
  };

  const genericError = computed(() => {
    if (errorRef.value && !errorRef.value.fields) {
      return errorRef.value.detail;
    }
    return null;
  });

  return { hasError, getError, genericError };
}
