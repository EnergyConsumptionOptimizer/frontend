import { confirmDeleteDialog } from "@/utils/ui/confirmPresets.js";

export function deleteZoneDialog(acceptCallback) {
  return confirmDeleteDialog({
    message: "Are you sure you want to delete this zone?",
    header: "Delete Zone",
    onAccept: acceptCallback,
  });
}
