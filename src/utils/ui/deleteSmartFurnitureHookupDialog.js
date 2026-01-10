import { confirmDeleteDialog } from "@/utils/ui/confirmPresets.js";

export function deleteSmartFurnitureHookupDialog(acceptCallback) {
  return confirmDeleteDialog({
    message: "Are you sure you want to delete this smart furniture hookup?",
    header: "Delete smart furniture hookup",
    onAccept: acceptCallback,
  });
}
