import { computed } from "vue";

/**
 * Validates a string value against specific business rules (Unique, Reserved).
 */
export function useNameValidation(
  valueRef,
  listRef,
  currentIdRef,
  key = "name",
) {
  const validationError = computed(() => {
    const val = valueRef.value?.trim();

    // Let the form handle required validation on submit to avoid double messaging.
    if (!val) return null;

    const normalized = val.toLowerCase();

    if (normalized === "admin") {
      return "This name is reserved.";
    }

    const isTaken = listRef.value.some(
      (item) =>
        item?.[key]?.toLowerCase() === normalized &&
        item?.id !== currentIdRef.value,
    );

    if (isTaken) {
      return "This name is already in use.";
    }

    return null;
  });

  const isValid = computed(() => !validationError.value);

  return { validationError, isValid };
}
