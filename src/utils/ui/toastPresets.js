export function deletedToast(entityLabel) {
  return {
    severity: "info",
    summary: "Deleted",
    detail: `${entityLabel} deleted successfully`,
    life: 3000,
  };
}

export function errorToast({
  summary = "Error",
  detail = "Error!",
  life = 3000,
} = {}) {
  return {
    severity: "error",
    summary,
    detail,
    life,
  };
}
