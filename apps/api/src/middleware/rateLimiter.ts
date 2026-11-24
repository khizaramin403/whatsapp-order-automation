import { Request, Response } from "express";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { RedisStore, RedisReply } from "rate-limit-redis";
import { redis } from "../config/redis";
import { env } from "../config/env";
import { sendError } from "../utils/response";

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  prefix?: string;
  keyGenerator?: (req: Request) => string;
  useMemoryStore?: boolean;
}

export function createLimiter(options: RateLimiterOptions): RateLimitRequestHandler {
  const useMemory = options.useMemoryStore ?? (env.NODE_ENV === "test");

  const store = useMemory
    ? undefined
    : new RedisStore({
        sendCommand: (...args: string[]) =>
          redis.call(args[0], ...args.slice(1)) as Promise<RedisReply>,
        prefix: options.prefix || "rl:default:",
      });

  return rateLimit({
    windowMs: options.windowMs,
    limit: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    validate: false,
    keyGenerator:
      options.keyGenerator ||
      ((req: Request) => req.ip || req.socket.remoteAddress || "unknown"),
    handler: (req: Request, res: Response, _next, opts) => {
      const requestId = (req.id as string) || (req.headers["x-request-id"] as string) || "unknown";
      const retryAfterSeconds = Math.ceil(opts.windowMs / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return sendError(
        res,
        "RATE_LIMITED",
        "Too many requests, please try again later",
        429,
        requestId
      );
    },
  });
}

// Preset: login (5 per minute, keyed by IP + email)
export const loginLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 5,
  prefix: "rl:login:",
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const email = (req.body?.email || "").toString().toLowerCase().trim();
    return email ? `${ip}_${email}` : ip;
  },
});

// Preset: dashboard APIs (100 per minute, keyed by user id)
export const dashboardLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  prefix: "rl:dashboard:",
  keyGenerator: (req: Request) => {
    const userId = (req as Request & { user?: { id?: string; userId?: string } }).user?.id ||
      (req as Request & { user?: { id?: string; userId?: string } }).user?.userId;
    if (userId) return `user_${userId}`;
    return req.ip || req.socket.remoteAddress || "unknown";
  },
});

// Preset: webhook (high limit, keyed by IP)
export const webhookLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 1000,
  prefix: "rl:webhook:",
  keyGenerator: (req: Request) => req.ip || req.socket.remoteAddress || "unknown",
});
