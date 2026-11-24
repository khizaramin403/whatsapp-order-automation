import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { loginLimiter } from "../middleware/rateLimiter";

export const loginSchema = z.object({
  email: z.string().email("A valid email address is required"),
  password: z.string().min(1, "Password is required"),
});

export const languageSchema = z.object({
  language: z.enum(["en", "ar", "ur-Latn"], {
    errorMap: () => ({ message: "Language must be one of: en, ar, ur-Latn" }),
  }),
});

export const authRouter = Router();

authRouter.post("/login", loginLimiter, validate({ body: loginSchema }), authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", authenticate, authController.me);
authRouter.patch("/me", authenticate, validate({ body: languageSchema }), authController.updateLanguage);

export default authRouter;
