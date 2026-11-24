import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/response";
import { logger } from "../utils/logger";

export { AppError };

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response | void {
  const requestId = (req.id as string) || (req.headers["x-request-id"] as string) || "unknown";

  if (err instanceof AppError) {
    if (req.log) {
      req.log.warn({ err, requestId, code: err.code }, err.message);
    } else {
      logger.warn({ err, requestId, code: err.code }, err.message);
    }

    return sendError(
      res,
      err.code,
      err.message,
      err.statusCode,
      requestId,
      err.details
    );
  }

  // Unknown or unhandled internal error: log full stack trace securely on the server
  if (req.log) {
    req.log.error({ err, requestId }, err.message || "Unhandled internal error");
  } else {
    logger.error({ err, requestId }, err.message || "Unhandled internal error");
  }

  // Never leak internal stack traces or internal implementation details to the client
  return sendError(
    res,
    "INTERNAL_SERVER_ERROR",
    "An unexpected error occurred",
    500,
    requestId
  );
}
