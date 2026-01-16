const INFRASTRUCTURE_ERRORS = {
  502: {
    summary: "Service Unavailable",
    detail: "Backend service unreachable (Bad Gateway).",
  },
  504: {
    summary: "Request Timeout",
    detail: "Server took too long to respond (Gateway Timeout).",
  },
};

const STATUS_TITLES = {
  400: "Invalid Request",
  401: "Authentication Required",
  403: "Access Denied",
  404: "Not Found",
  409: "Conflict",
  422: "Validation Error",
  429: "Too Many Requests",
  500: "Server Error",
};

/**
 * Tries to extract a simple string message from various JSON structures.
 * Supports: RFC 7807, standard keys (message, error), and simple strings.
 */
function parseDirectMessage(data) {
  if (typeof data === "string") {
    // Ignore HTML strings (likely NGINX default pages)
    return data.trim().startsWith("<") ? null : data;
  }
  if (typeof data === "object" && data !== null) {
    return (
      data.detail ||
      data.title ||
      data.message ||
      data.error ||
      data.description ||
      null
    );
  }
  return null;
}

/**
 * Handles complex validation error structures (Arrays or Objects).
 * Flatten them into a single readable string.
 */
function parseValidationErrors(data) {
  if (!data?.errors) return null;

  const { errors } = data;

  if (Array.isArray(errors)) {
    // Handle array of strings or objects with 'message'/'msg' keys
    return errors
      .map((e) =>
        typeof e === "object" ? e.message || e.msg || JSON.stringify(e) : e,
      )
      .join(", ");
  }

  if (typeof errors === "object") {
    // Handle object map: { email: "Invalid", password: "Too short" }
    return Object.values(errors).flat().join(", ");
  }

  return null;
}

export function normalizeError(err) {
  // 1. Ignore cancellations
  if (!err || err.code === "ERR_CANCELED") return null;

  // 2. Network / Offline Errors
  if (err.request && !err.response) {
    return {
      summary: "Connection Failed",
      detail: "Unable to reach the server.",
    };
  }

  // 3. Server Responses
  if (err.response) {
    const { status, data } = err.response;

    // A. Check for Blob (File Download Errors)
    if (data instanceof Blob) {
      return (
        INFRASTRUCTURE_ERRORS[status] || {
          summary: "Download Failed",
          detail: `Server returned error ${status} during download.`,
        }
      );
    }

    // B. Check for Infrastructure Errors (NGINX Gateways)
    if (INFRASTRUCTURE_ERRORS[status]) {
      // However, if the API explicitly sent a valid JSON message despite 502/503, prefer that.
      const explicitMsg = parseDirectMessage(data);
      if (!explicitMsg) return INFRASTRUCTURE_ERRORS[status];
    }

    // C. Extract content from Body (JSON/Validation/Text)
    const detail = parseDirectMessage(data) || parseValidationErrors(data);
    const summary = STATUS_TITLES[status] || `Error ${status}`;

    // Return extracted info or fallback to Status Text
    return {
      summary,
      detail:
        detail || err.response.statusText || "An unexpected error occurred.",
    };
  }

  // 4. Code/Application Errors
  return {
    summary: "Application Error",
    detail: err.message || "Something went wrong internally.",
  };
}
