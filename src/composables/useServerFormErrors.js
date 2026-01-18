import { computed } from "vue";

export function useServerFormErrors(errorRef) {
  const hasError = (field) => {
    return !!errorRef.value?.fields?.[field];
  };

  const getError = (field) => {
    return errorRef.value?.fields?.[field] || "";
  };

  const formGlobalError = computed(() => {
    if (!errorRef.value) return null;
    const hasFields =
      errorRef.value.fields && Object.keys(errorRef.value.fields).length > 0;

    if (hasFields) {
      return null;
    }

    return errorRef.value.detail;
  });

  return { hasError, getError, formGlobalError };
}
