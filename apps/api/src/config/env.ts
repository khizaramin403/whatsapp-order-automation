import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z
  .object({
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    REDIS_URL: z.string().min(1, "REDIS_URL is required"),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),

    // JWT & Authentication
    JWT_SECRET: z.string().default("dev_jwt_secret_change_me_in_production_min32chars!"),
    JWT_EXPIRES_IN: z.string().default("15m"),
    REFRESH_TOKEN_DAYS: z.coerce.number().int().min(7).max(30).default(14),
    REFRESH_TOKEN_COOKIE_NAME: z.string().default("refreshToken"),
    COOKIE_DOMAIN: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === "production") {
        if (!data.JWT_SECRET || data.JWT_SECRET.length < 32) {
          return false;
        }
        if (
          data.JWT_SECRET.includes("dev_jwt_secret") ||
          data.JWT_SECRET.includes("change_me") ||
          data.JWT_SECRET.toLowerCase() === "secret"
        ) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "In production, JWT_SECRET must be at least 32 characters long and cannot use a default development secret",
      path: ["JWT_SECRET"],
    }
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid or missing environment configuration:");
  for (const [key, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
    console.error(` - ${key}: ${(issues as string[]).join(", ")}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
