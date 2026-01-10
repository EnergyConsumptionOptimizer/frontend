export function confirmDeleteDialog({
  message,
  header,
  onAccept,
  onReject,
  acceptLabel = "Delete",
  rejectLabel = "Cancel",
}) {
  return {
    message,
    header,
    icon: "pi pi-info-circle",
    rejectLabel,
    rejectProps: {
      label: rejectLabel,
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: acceptLabel,
      severity: "danger",
    },
    accept: onAccept,
    reject: onReject,
  };
}
