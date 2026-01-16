const BASE_TOAST = { life: 3000 };

export const deletedToast = (entityLabel) => ({
  ...BASE_TOAST,
  severity: "info",
  summary: "Deleted",
  detail: `${entityLabel} deleted successfully`,
});

export const errorToast = (summary = "Error", detail = "Failed") => ({
  ...BASE_TOAST,
  life: 5000,
  severity: "error",
  summary,
  detail,
});
