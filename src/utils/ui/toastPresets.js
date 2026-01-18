const BASE_TOAST = { life: 3000 };

export const deletedToast = (entityLabel) => ({
  ...BASE_TOAST,
  severity: "info",
  summary: "Deleted",
  detail: `${entityLabel} deleted successfully`,
});

export const errorToast = (
  summaryOrConfig = "Error",
  detailIfString = "Failed",
) => {
  let summary = summaryOrConfig;
  let detail = detailIfString;

  if (typeof summaryOrConfig === "object" && summaryOrConfig !== null) {
    summary = summaryOrConfig.summary || "Error";
    detail = summaryOrConfig.detail || "Failed";
  }

  return {
    ...BASE_TOAST,
    life: 5000,
    severity: "error",
    summary,
    detail,
  };
};
