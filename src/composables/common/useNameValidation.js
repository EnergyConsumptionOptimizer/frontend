import { computed } from "vue";

export function useNameValidation(
  valueRef,
  listRef,
  idRef,
  fieldName = "name",
) {
  const validationError = computed(() => {
    if (!valueRef.value) {
      return null;
    }

    const valueToCheck = valueRef.value.trim().toLowerCase();

    const exists = listRef.value.some((item) => {
      // Ignora l'elemento corrente se stiamo modificando (check tramite ID)
      if (idRef.value && item.id === idRef.value) {
        return false;
      }

      const itemValue = item[fieldName]?.trim().toLowerCase();
      return itemValue === valueToCheck;
    });

    if (exists) {
      return `The ${fieldName} is already in use`;
    }

    return null;
  });

  const isValid = computed(() => !validationError.value);

  return {
    validationError,
    isValid,
  };
}
