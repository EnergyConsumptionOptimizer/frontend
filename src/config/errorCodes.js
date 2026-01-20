/**
 * Centralized error code configuration
 * Defines which error codes should not trigger automatic toast notifications
 */

/**
 * Error codes that should be handled manually by components
 * These errors typically require custom UI feedback or user interaction
 */
export const MANUAL_HANDLED_ERROR_CODES = [
  "UNAUTHORIZED",
  "BAD_REQUEST",
  "VALIDATION_ERROR",
  "INTERNAL_ERROR",
  "INFRASTRUCTURE_ERROR",
  "NETWORK_ERROR",
  "TIMEOUT",
];

/**
 * Check if an error code should be handled manually
 */
export function isManuallyHandledError(code) {
  return MANUAL_HANDLED_ERROR_CODES.includes(code);
}
