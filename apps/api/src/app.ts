import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { env } from "./config";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware";
import { apiV1Router } from "./routes";
import { AppError } from "./utils/errors";
import swaggerUi from "swagger-ui-express";
import { openapiDocument } from "./docs/openapi";

const app = express();

// Trust reverse proxy for rate limiting and IP resolution
app.set("trust proxy", 1);

// Security headers & CORS
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body and cookie parsers
app.use(express.json());
app.use(cookieParser());

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

// Health check endpoint (outside /api/v1)
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Mount all API endpoints under /api/v1
app.use("/api/v1", apiV1Router);

// OpenAPI interactive documentation (non-production only)
if (env.NODE_ENV !== "production") {
  app.get("/api/docs/openapi.json", (_req: Request, res: Response) => {
    res.status(200).json(openapiDocument);
  });
  app.use(
    "/api/docs",
    (_req: Request, res: Response, next: NextFunction) => {
      res.removeHeader("Content-Security-Policy");
      next();
    },
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument)
  );
}

// 404 for unknown routes
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError("Route not found", 404, "NOT_FOUND"));
});

// Centralized error handler
app.use(errorHandler);

export default app;
