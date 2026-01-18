const STATUS_TITLES = {
  400: "Invalid Request",
  401: "Authentication Required",
  403: "Access Denied",
  404: "Not Found",
  409: "Conflict",
  422: "Validation Error",
  429: "Too Many Requests",
  500: "Server Error",
  502: "Service Unavailable",
};

const STATUS_TO_CODE = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "RESOURCE_NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION_ERROR",
  500: "INTERNAL_ERROR",
  502: "INFRASTRUCTURE_ERROR",
};

const CODE_TITLES = {
  VALIDATION_ERROR: "Validation Failed",
  CONFLICT: "Conflict",
  RESOURCE_NOT_FOUND: "Not Found",
  INTERNAL_ERROR: "System Error",
  INFRASTRUCTURE_ERROR: "Infrastructure Error",
};

export function normalizeError(err) {
  if (!err || err.code === "ERR_CANCELED") return null;

  if (err.request && !err.response) {
    return {
      code: "NETWORK_ERROR",
      summary: "Connection Failed",
      detail:
        "Unable to reach the server. Please check your internet connection.",
      fields: {},
      status: 0,
      isSystemError: true,
    };
  }

  if (err.response) {
    const { status, data } = err.response;

    if (data instanceof Blob) {
      return {
        code: "DOWNLOAD_ERROR",
        summary: "Download Failed",
        detail: "File could not be downloaded.",
        fields: {},
        status,
        isSystemError: true,
      };
    }

    const code = data?.code || STATUS_TO_CODE[status] || "UNKNOWN_ERROR";

    const message =
      data?.message ||
      data?.detail ||
      err.response.statusText ||
      "An unexpected error occurred.";

    const fields = data?.errors || {};

    const isSystemError =
      status >= 500 ||
      code === "INFRASTRUCTURE_ERROR" ||
      code === "INTERNAL_ERROR";

    const summary =
      CODE_TITLES[code] || STATUS_TITLES[status] || `Error ${status}`;

    return {
      code,
      status,
      summary,
      detail: message,
      fields,
      isSystemError,
      raw: data,
    };
  }

  console.error("Unhandled application error", err);

  return {
    code: "APP_ERROR",
    summary: "Application Error",
    detail: err.message || "Something went wrong internally.",
    fields: {},
    status: -1,
    isSystemError: true,
  };
}
