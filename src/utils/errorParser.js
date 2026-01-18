const LOCAL_INFRASTRUCTURE_ERRORS = {
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

const STATUS_TO_CODE = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "RESOURCE_NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION_ERROR",
  500: "INTERNAL_ERROR",
};

const CODE_TITLES = {
  VALIDATION_ERROR: "Validation Failed",
  CONFLICT: "Conflict",
  RESOURCE_NOT_FOUND: "Not Found",
  INTERNAL_ERROR: "System Error",
};

function parseDirectMessage(data) {
  if (typeof data === "string") {
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

function parseValidationErrors(data) {
  if (!data?.errors) return null;
  const { errors } = data;

  if (Array.isArray(errors)) {
    return errors
      .map((e) =>
        typeof e === "object" ? e.message || e.msg || JSON.stringify(e) : e,
      )
      .join(", ");
  }

  if (typeof errors === "object") {
    return Object.values(errors).flat().join(", ");
  }

  return null;
}

export function normalizeError(err) {
  if (!err || err.code === "ERR_CANCELED") return null;

  if (err.request && !err.response) {
    return {
      code: "NETWORK_ERROR",
      summary: "Connection Failed",
      detail: "Unable to reach the server.",
      fields: null,
      status: 0,
    };
  }

  if (err.response) {
    const { status, data } = err.response;

    if (data instanceof Blob) {
      return (
        LOCAL_INFRASTRUCTURE_ERRORS[status] || {
          code: "DOWNLOAD_ERROR",
          summary: "Download Failed",
          detail: `Server returned error ${status} during download.`,
          fields: null,
          status,
        }
      );
    }

    if (LOCAL_INFRASTRUCTURE_ERRORS[status]) {
      const explicitMsg = parseDirectMessage(data);
      if (!explicitMsg) {
        return {
          ...LOCAL_INFRASTRUCTURE_ERRORS[status],
          code: "INFRASTRUCTURE_ERROR",
          fields: null,
          status,
        };
      }
    }

    const code = data?.code || STATUS_TO_CODE[status] || "UNKNOWN_ERROR";
    const fields = data?.errors || null;

    const detail =
      parseDirectMessage(data) ||
      parseValidationErrors(data) ||
      err.response.statusText ||
      "An unexpected error occurred.";

    const summary =
      CODE_TITLES[code] || STATUS_TITLES[status] || `Error ${status}`;

    return {
      code,
      status,
      summary,
      detail,
      fields,
      raw: data,
    };
  }

  console.error("Unhandled application error", err);
  return {
    code: "APP_ERROR",
    summary: "Application Error",
    detail: err.message || "Something went wrong internally.",
    fields: null,
    status: -1,
  };
}
