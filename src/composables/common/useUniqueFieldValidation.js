import { computed } from "vue";

export function useUniqueFieldValidation(
  valueRef,
  listRef,
  idRef,
  fieldProperty = "name",
  fieldLabel = null,
) {
  const validationError = computed(() => {
    if (!valueRef.value) {
      return null;
    }
    const valueToCheck = String(valueRef.value).trim().toLowerCase();

    const currentId = idRef?.value;

    const exists = listRef.value.some((item) => {
      const itemId = item.id;

      if (currentId && itemId === currentId) return false;

      const itemValue = String(item[fieldProperty] || "")
        .trim()
        .toLowerCase();
      return itemValue === valueToCheck;
    });

    if (exists) {
      const displayLabel =
        fieldLabel ||
        fieldProperty.charAt(0).toUpperCase() + fieldProperty.slice(1);

      return `${displayLabel} already exists`;
    }

    return null;
  });

  const isValid = computed(() => !validationError.value);

  return {
    validationError,
    isValid,
  };
}
