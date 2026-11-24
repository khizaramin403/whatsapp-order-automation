import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { settingsController } from "../controllers/settings.controller";
import { authenticate, tenant, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { dashboardLimiter } from "../middleware/rateLimiter";

const updateSettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  default_language: z.enum(["en", "ar", "ur-Latn"]).optional(),
  open_hours: z.any().optional(),
  delivery_fee: z.number().int().nonnegative().optional(),
  minimum_order: z.number().int().nonnegative().optional(),
  delivery_area: z.string().nullable().optional(),
  payment_account: z.string().nullable().optional(),
  payment_instructions: z.string().nullable().optional(),
  bot_welcome_en: z.string().nullable().optional(),
  bot_welcome_ar: z.string().nullable().optional(),
  bot_welcome_ur: z.string().nullable().optional(),
  bot_payment_en: z.string().nullable().optional(),
  bot_payment_ar: z.string().nullable().optional(),
  bot_payment_ur: z.string().nullable().optional(),
  email_notifications: z.boolean().optional(),
  daily_summary_email: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  sound_notifications: z.boolean().optional(),
  notification_email: z.string().email("A valid email is required").nullable().optional(),
});

export const settingsRouter = Router();

// Middleware: Authenticate, tenant isolation, rate limit, role owner
settingsRouter.use(
  authenticate,
  tenant,
  dashboardLimiter,
  requireRole(Role.owner, Role.super_admin)
);

settingsRouter.get("/", settingsController.getSettings);
settingsRouter.patch("/", validate({ body: updateSettingsSchema }), settingsController.updateSettings);

export default settingsRouter;
