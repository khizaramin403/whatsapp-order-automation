import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../utils/errors";

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export interface FieldValidationError {
  field: string;
  message: string;
}

export function validate(schemas: ValidationSchemas) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as typeof req.params;
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as typeof req.query;
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: FieldValidationError[] = error.errors.map((e) => ({
          field: e.path.length > 0 ? e.path.join(".") : "_general",
          message: e.message,
        }));
        next(new AppError("Validation failed", 400, "VALIDATION_ERROR", fieldErrors));
        return;
      }
      next(error);
    }
  };
}
