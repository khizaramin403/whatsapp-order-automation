import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import crypto from "crypto";
import pinoHttp from "pino-http";
import { env } from "./config";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware";

const app = express();

// Security headers & CORS
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Request logging with correlation ID
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => (req.headers["x-request-id"] as string) || crypto.randomUUID(),
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  })
);

// Set correlation header on response
app.use((req, res, next) => {
  if (req.id) {
    res.setHeader("x-request-id", req.id as string);
  }
  next();
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Centralized error handler
app.use(errorHandler);

export default app;

