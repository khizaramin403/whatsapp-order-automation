export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  ORDER_INVALID_TRANSITION: "ORDER_INVALID_TRANSITION",
  BAD_REQUEST: "BAD_REQUEST",
  CONFLICT: "CONFLICT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode] | string;

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCodeType;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code: ErrorCodeType = ErrorCode.INTERNAL_SERVER_ERROR,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, code: ErrorCodeType = ErrorCode.BAD_REQUEST, details?: unknown) {
    return new AppError(message, 400, code, details);
  }

  static unauthenticated(message = "Authentication required", details?: unknown) {
    return new AppError(message, 401, ErrorCode.UNAUTHENTICATED, details);
  }

  static forbidden(message = "Access denied", details?: unknown) {
    return new AppError(message, 403, ErrorCode.FORBIDDEN, details);
  }

  static notFound(message = "Resource not found", details?: unknown) {
    return new AppError(message, 404, ErrorCode.NOT_FOUND, details);
  }

  static rateLimited(message = "Too many requests, please try again later", details?: unknown) {
    return new AppError(message, 429, ErrorCode.RATE_LIMITED, details);
  }

  static validation(message = "Validation failed", details?: unknown) {
    return new AppError(message, 400, ErrorCode.VALIDATION_ERROR, details);
  }

  static invalidOrderTransition(message: string, details?: unknown) {
    return new AppError(message, 400, ErrorCode.ORDER_INVALID_TRANSITION, details);
  }
}
