import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import app from "../app";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { Role } from "@prisma/client";
import { authenticate, requireRole, tenant } from "../middleware/auth";
import { errorHandler } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";

describe("Authentication & JWT Flow", () => {
  const TEST_RESTAURANT_ID = "00000000-0000-4000-8000-000000000001";
  const TEST_INACTIVE_USER_EMAIL = "inactive_test_user@demo.local";

  beforeAll(async () => {
    // Ensure inactive test user exists for testing
    const hash = await bcrypt.hash("Password123!", 10);
    await prisma.user.upsert({
      where: { email: TEST_INACTIVE_USER_EMAIL },
      create: {
        id: "00000000-0000-4000-8000-000000000999",
        restaurant_id: TEST_RESTAURANT_ID,
        name: "Inactive Tester",
        email: TEST_INACTIVE_USER_EMAIL,
        password_hash: hash,
        role: Role.manager,
        is_active: false,
      },
      update: {
        is_active: false,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: TEST_INACTIVE_USER_EMAIL },
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("logs in successfully with valid credentials, returns accessToken and sets httpOnly cookie", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "owner@demo.local",
          password: "Password123!",
        })
        .expect(200);

      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user).toMatchObject({
        email: "owner@demo.local",
        role: "owner",
        restaurant_id: TEST_RESTAURANT_ID,
      });

      // Verify token payload
      const decoded = jwt.verify(
        res.body.data.accessToken,
        env.JWT_SECRET
      ) as jwt.JwtPayload & { userId: string; role: string; restaurantId: string };
      expect(decoded.userId).toBe(res.body.data.user.id);
      expect(decoded.role).toBe("owner");
      expect(decoded.restaurantId).toBe(TEST_RESTAURANT_ID);

      // Verify cookie
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join(";") : cookies;
      expect(cookieStr).toContain(env.REFRESH_TOKEN_COOKIE_NAME);
      expect(cookieStr.toLowerCase()).toContain("httponly");
      expect(cookieStr.toLowerCase()).toContain("samesite=lax");
    });

    it("returns identical 401 UNAUTHENTICATED error on wrong password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "owner@demo.local",
          password: "WrongPassword999!",
        })
        .expect(401);

      expect(res.body.error).toMatchObject({
        code: "UNAUTHENTICATED",
        message: "Invalid email or password",
      });
    });

    it("returns identical 401 UNAUTHENTICATED error on non-existent email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "does_not_exist@demo.local",
          password: "Password123!",
        })
        .expect(401);

      expect(res.body.error).toMatchObject({
        code: "UNAUTHENTICATED",
        message: "Invalid email or password",
      });
    });

    it("rejects login for inactive user with 403 FORBIDDEN", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: TEST_INACTIVE_USER_EMAIL,
          password: "Password123!",
        })
        .expect(403);

      expect(res.body.error).toMatchObject({
        code: "FORBIDDEN",
        message: "Account is inactive",
      });
    });

    it("enforces login rate limit (5 attempts per minute per IP+email)", async () => {
      const targetEmail = "ratelimit_test@demo.local";
      const ip = "192.168.1.100";

      // Attempt 5 requests
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post("/api/v1/auth/login")
          .set("x-forwarded-for", ip)
          .send({ email: targetEmail, password: "WrongPassword!" });
      }

      // 6th attempt should be blocked
      const blocked = await request(app)
        .post("/api/v1/auth/login")
        .set("x-forwarded-for", ip)
        .send({ email: targetEmail, password: "WrongPassword!" })
        .expect(429);

      expect(blocked.body.error.code).toBe("RATE_LIMITED");
      expect(blocked.headers["retry-after"]).toBeDefined();
    });
  });

  describe("Token Expiration, Refresh Rotation & Reuse Detection", () => {
    it("rejects expired access token", async () => {
      const expiredToken = jwt.sign(
        { userId: "test-user-id", role: "owner", restaurantId: TEST_RESTAURANT_ID },
        env.JWT_SECRET,
        { expiresIn: "0s" }
      );

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("authorization", `Bearer ${expiredToken}`)
        .expect(401);

      expect(res.body.error).toMatchObject({
        code: "UNAUTHENTICATED",
        message: "Access token expired",
      });
    });

    it("rotates refresh token on POST /api/v1/auth/refresh and revokes the old one", async () => {
      // 1. Login to get initial refresh token
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "chef@demo.local", password: "Password123!" })
        .expect(200);

      const initialCookie = loginRes.headers["set-cookie"][0];
      const tokenMatch = initialCookie.match(new RegExp(`${env.REFRESH_TOKEN_COOKIE_NAME}=([^;]+)`));
      const initialRefreshToken = tokenMatch ? tokenMatch[1] : "";
      expect(initialRefreshToken).toBeTruthy();

      // 2. Call refresh endpoint with initial cookie
      const refreshRes = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", [`${env.REFRESH_TOKEN_COOKIE_NAME}=${initialRefreshToken}`])
        .expect(200);

      expect(refreshRes.body.data.accessToken).toBeDefined();

      const newCookie = refreshRes.headers["set-cookie"][0];
      const newTokenMatch = newCookie.match(new RegExp(`${env.REFRESH_TOKEN_COOKIE_NAME}=([^;]+)`));
      const newRefreshToken = newTokenMatch ? newTokenMatch[1] : "";
      expect(newRefreshToken).toBeTruthy();
      expect(newRefreshToken).not.toBe(initialRefreshToken);

      // 3. REUSE DETECTION: Presenting the OLD refresh token again must trigger full session revocation
      const reuseRes = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", [`${env.REFRESH_TOKEN_COOKIE_NAME}=${initialRefreshToken}`])
        .expect(401);

      expect(reuseRes.body.error.code).toBe("UNAUTHENTICATED");
      expect(reuseRes.body.error.message).toContain("token reuse");

      // 4. Verification: Even the new refresh token should now be invalidated because all sessions were revoked
      const nextAttempt = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", [`${env.REFRESH_TOKEN_COOKIE_NAME}=${newRefreshToken}`])
        .expect(401);

      expect(nextAttempt.body.error.code).toBe("UNAUTHENTICATED");
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("revokes token and clears refresh cookie", async () => {
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "rider@demo.local", password: "Password123!" })
        .expect(200);

      const cookie = loginRes.headers["set-cookie"][0];

      const logoutRes = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", [cookie])
        .expect(200);

      expect(logoutRes.body.data.message).toBe("Logged out successfully");

      // Verify cookie cleared
      const clearedCookies = logoutRes.headers["set-cookie"];
      const cookieStr = Array.isArray(clearedCookies) ? clearedCookies.join(";") : clearedCookies;
      expect(cookieStr).toContain(`${env.REFRESH_TOKEN_COOKIE_NAME}=;`);
    });
  });

  describe("GET /api/v1/auth/me & PATCH /api/v1/auth/me", () => {
    it("retrieves current authenticated user profile and hotel info", async () => {
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "manager@demo.local", password: "Password123!" })
        .expect(200);

      const token = loginRes.body.data.accessToken;

      const meRes = await request(app)
        .get("/api/v1/auth/me")
        .set("authorization", `Bearer ${token}`)
        .expect(200);

      expect(meRes.body.data).toMatchObject({
        email: "manager@demo.local",
        role: "manager",
        name: "Ayesha Khan",
        restaurant: {
          id: TEST_RESTAURANT_ID,
          name: "Grand Continental Hotel & Suites",
        },
      });
    });

    it("updates user profile language (en, ar, ur-Latn) and validates input", async () => {
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "manager@demo.local", password: "Password123!" })
        .expect(200);

      const token = loginRes.body.data.accessToken;

      // Update to Arabic
      const patchRes = await request(app)
        .patch("/api/v1/auth/me")
        .set("authorization", `Bearer ${token}`)
        .send({ language: "ar" })
        .expect(200);

      expect(patchRes.body.data.language).toBe("ar");

      // Verify GET /me returns updated language
      const meRes = await request(app)
        .get("/api/v1/auth/me")
        .set("authorization", `Bearer ${token}`)
        .expect(200);

      expect(meRes.body.data.language).toBe("ar");

      // Reset back to English
      await request(app)
        .patch("/api/v1/auth/me")
        .set("authorization", `Bearer ${token}`)
        .send({ language: "en" })
        .expect(200);

      // Invalid language rejected
      const invalidRes = await request(app)
        .patch("/api/v1/auth/me")
        .set("authorization", `Bearer ${token}`)
        .send({ language: "french" })
        .expect(400);

      expect(invalidRes.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("Role and Tenant Middleware Isolation", () => {
    const testApp = express();
    testApp.use(express.json());

    // Owner or Manager route
    testApp.get(
      "/test-protected/manage",
      authenticate,
      requireRole(Role.owner, Role.manager),
      tenant,
      (req, res) => {
        sendSuccess(res, { tenantId: req.restaurantId, role: req.user?.role });
      }
    );

    // Chef-only route
    testApp.get(
      "/test-protected/kitchen",
      authenticate,
      requireRole(Role.chef),
      tenant,
      (req, res) => {
        sendSuccess(res, { tenantId: req.restaurantId, role: req.user?.role });
      }
    );

    // Super Admin route
    testApp.get(
      "/test-protected/admin",
      authenticate,
      requireRole(Role.super_admin),
      tenant,
      (req, res) => {
        sendSuccess(res, { isSuperAdmin: true, tenantId: req.restaurantId });
      }
    );

    testApp.use(errorHandler);

    it("allows authorized roles and strictly enforces tenant from JWT token", async () => {
      const ownerToken = jwt.sign(
        { userId: "user-owner-1", role: Role.owner, restaurantId: TEST_RESTAURANT_ID },
        env.JWT_SECRET
      );

      const res = await request(testApp)
        .get("/test-protected/manage")
        .set("authorization", `Bearer ${ownerToken}`)
        .expect(200);

      expect(res.body.data.tenantId).toBe(TEST_RESTAURANT_ID);
      expect(res.body.data.role).toBe("owner");
    });

    it("denies unauthorized role with 403 FORBIDDEN", async () => {
      const riderToken = jwt.sign(
        { userId: "user-rider-1", role: Role.rider, restaurantId: TEST_RESTAURANT_ID },
        env.JWT_SECRET
      );

      // Rider tries to access manage route
      const res = await request(testApp)
        .get("/test-protected/manage")
        .set("authorization", `Bearer ${riderToken}`)
        .expect(403);

      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("handles super_admin separately without requiring a restaurantId", async () => {
      const superAdminToken = jwt.sign(
        { userId: "user-admin-1", role: Role.super_admin, restaurantId: null },
        env.JWT_SECRET
      );

      const res = await request(testApp)
        .get("/test-protected/admin")
        .set("authorization", `Bearer ${superAdminToken}`)
        .expect(200);

      expect(res.body.data.isSuperAdmin).toBe(true);
      expect(res.body.data.tenantId).toBeUndefined();
    });
  });
});
