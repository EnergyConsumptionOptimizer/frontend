import { errorToast } from "@/utils/ui/toastPresets.js";

export function collisionZoneToast(message) {
  return errorToast({
    summary: "Collision error",
    detail: message,
  });
}
