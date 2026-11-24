export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly requestId?: string;
  public readonly details?: ValidationErrorDetail[];
  public readonly retryAfterSeconds?: number;

  constructor(
    code: string,
    status: number,
    message: string,
    options?: {
      requestId?: string;
      details?: ValidationErrorDetail[];
      retryAfterSeconds?: number;
    }
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.requestId = options?.requestId;
    this.details = options?.details;
    this.retryAfterSeconds = options?.retryAfterSeconds;
  }
}

const KNOWN_ERROR_CODES = new Set([
  "VALIDATION_ERROR",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "RATE_LIMITED",
  "ORDER_INVALID_TRANSITION",
  "BAD_REQUEST",
  "CONFLICT",
  "INTERNAL_SERVER_ERROR",
  "NETWORK_ERROR",
]);

/**
 * Translates an ApiError (or generic Error) using next-intl `errors` namespace.
 */
export function getApiErrorMessage(
  error: unknown,
  tErrors: (key: string, values?: Record<string, string | number>) => string
): string {
  if (error instanceof ApiError) {
    if (error.code === "RATE_LIMITED" && error.retryAfterSeconds) {
      return tErrors("RATE_LIMITED_SECONDS", {
        seconds: error.retryAfterSeconds,
      });
    }

    if (KNOWN_ERROR_CODES.has(error.code)) {
      return tErrors(error.code);
    }

    return tErrors("UNKNOWN");
  }

  return tErrors("UNKNOWN");
}
