import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { AppError } from "../utils/errors";
import { AccessTokenPayload } from "../services/auth.service";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      restaurantId?: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(AppError.unauthenticated("Authentication token required"));
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(AppError.unauthenticated("Access token expired"));
      return;
    }
    next(AppError.unauthenticated("Invalid access token"));
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthenticated("Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(AppError.forbidden("Insufficient permissions for this action"));
      return;
    }

    next();
  };
}

export function tenant(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(AppError.unauthenticated("Authentication required"));
    return;
  }

  // super_admin has no tenant restaurant bound and is handled separately
  if (req.user.role === Role.super_admin) {
    req.restaurantId = undefined;
    next();
    return;
  }

  // Enforce tenant isolation: restaurantId comes strictly from the verified JWT, never the client
  if (!req.user.restaurantId) {
    next(AppError.forbidden("No restaurant associated with this user account"));
    return;
  }

  req.restaurantId = req.user.restaurantId;
  next();
}
