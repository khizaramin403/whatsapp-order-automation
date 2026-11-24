import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { analyticsController } from "../controllers/analytics.controller";
import { authenticate, tenant, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { dashboardLimiter } from "../middleware/rateLimiter";

const dateStringSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" });

export const summaryQuerySchema = z.object({
  range: z.enum(["today", "7d", "30d"]).optional(),
  dateFrom: dateStringSchema.optional(),
  dateTo: dateStringSchema.optional(),
});

export const analyticsRouter = Router();

// Middleware: Authenticate, tenant isolation, rate limit, role owner
analyticsRouter.use(
  authenticate,
  tenant,
  dashboardLimiter,
  requireRole(Role.owner, Role.super_admin)
);

analyticsRouter.get(
  "/summary",
  validate({ query: summaryQuerySchema }),
  analyticsController.getSummary
);

export default analyticsRouter;
