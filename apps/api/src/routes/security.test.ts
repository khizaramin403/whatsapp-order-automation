import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { Role, OrderStatus, OrderType, PaymentMethod, PaymentStatus } from "@prisma/client";
import {
  FIXTURE_HOTEL_A,
  tokensA,
} from "../test/multiTenantFixture";

describe("Security & Role Permission Matrix Tests", () => {

  // ========================================================
  // 1. Authentication & Token Security
  // ========================================================
  describe("Authentication & Token Integrity", () => {
    it("rejects access without a token with 401 UNAUTHENTICATED", async () => {
      const endpoints = [
        "/api/v1/auth/me",
        "/api/v1/orders",
        `/api/v1/orders/${FIXTURE_HOTEL_A.order.id}`,
        "/api/v1/menu/categories",
        "/api/v1/menu/items",
        "/api/v1/team",
        "/api/v1/settings",
        "/api/v1/analytics/summary",
      ];

      for (const endpoint of endpoints) {
        const res = await request(app).get(endpoint);
        expect(res.status).toBe(401);
        expect(res.body.error.code).toBe("UNAUTHENTICATED");
      }
    });

    it("rejects an expired access token with 401 UNAUTHENTICATED", async () => {
      const expiredToken = jwt.sign(
        { userId: FIXTURE_HOTEL_A.users.owner.id, restaurantId: FIXTURE_HOTEL_A.id, role: Role.owner },
        env.JWT_SECRET,
        { expiresIn: "-10s" } // Expired 10 seconds ago
      );

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHENTICATED");
      expect(res.body.error.message).toContain("expired");
    });

    it("rejects a token signed with a forged or different secret with 401 UNAUTHENTICATED", async () => {
      const forgedToken = jwt.sign(
        { userId: FIXTURE_HOTEL_A.users.owner.id, restaurantId: FIXTURE_HOTEL_A.id, role: Role.owner },
        "completely_wrong_secret_attacker_key_min32chars!!",
        { expiresIn: "15m" }
      );

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${forgedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHENTICATED");
      expect(res.body.error.message).toContain("Invalid access token");
    });

    it("revokes ALL sessions when a reused refresh token is presented", async () => {
      // 1. Login to get a valid refresh token
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: FIXTURE_HOTEL_A.users.owner.email,
          password: "Password123!",
        });
      expect(loginRes.status).toBe(200);

      const cookieHeader = loginRes.headers["set-cookie"];
      expect(cookieHeader).toBeDefined();
      const firstCookie = cookieHeader[0];

      // 2. Perform legitimate refresh (rotates token)
      const refreshRes1 = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", [firstCookie]);
      expect(refreshRes1.status).toBe(200);

      // 3. Re-present the OLD (now revoked) token (simulating attacker replay)
      const replayRes = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", [firstCookie]);

      expect(replayRes.status).toBe(401);
      expect(replayRes.body.error.code).toBe("UNAUTHENTICATED");

      // 4. Verify ALL sessions for this user have been revoked in the database
      const activeSessions = await prisma.refreshToken.findMany({
        where: {
          user_id: FIXTURE_HOTEL_A.users.owner.id,
          revoked_at: null,
        },
      });
      expect(activeSessions.length).toBe(0);
    });
  });

  // ========================================================
  // 2. Sensitive Data Leak Prevention
  // ========================================================
  describe("Sensitive Data Leak Prevention", () => {
    it("responses never leak password_hash, token_hash, or encrypted WhatsApp secrets", async () => {
      // 1. Login response
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: FIXTURE_HOTEL_A.users.owner.email,
          password: "Password123!",
        });
      const loginBodyStr = JSON.stringify(loginRes.body);
      expect(loginBodyStr).not.toContain("password_hash");
      expect(loginBodyStr).not.toContain("token_hash");
      expect(loginBodyStr).not.toContain("access_token_enc");

      // 2. GET /auth/me
      const meRes = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${tokensA.owner}`);
      const meStr = JSON.stringify(meRes.body);
      expect(meStr).not.toContain("password_hash");
      expect(meStr).not.toContain("token_hash");
      expect(meStr).not.toContain("access_token_enc");

      // 3. GET /team
      const teamRes = await request(app)
        .get("/api/v1/team")
        .set("Authorization", `Bearer ${tokensA.owner}`);
      const teamStr = JSON.stringify(teamRes.body);
      expect(teamStr).not.toContain("password_hash");

      // 4. GET /settings
      const settingsRes = await request(app)
        .get("/api/v1/settings")
        .set("Authorization", `Bearer ${tokensA.owner}`);
      const settingsStr = JSON.stringify(settingsRes.body);
      expect(settingsStr).not.toContain("access_token_enc");

      // 5. GET /orders
      const ordersRes = await request(app)
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${tokensA.owner}`);
      const ordersStr = JSON.stringify(ordersRes.body);
      expect(ordersStr).not.toContain("password_hash");
    });

    it("error responses never leak stack traces (production & test mode)", async () => {
      // Trigger a 400 validation error
      const valErrRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "invalid-email" });

      expect(valErrRes.status).toBe(400);
      expect(valErrRes.body.error).toHaveProperty("code");
      expect(valErrRes.body.error).toHaveProperty("message");
      expect(valErrRes.body.error).toHaveProperty("requestId");
      expect(valErrRes.body.error.stack).toBeUndefined();

      // Trigger a 404 error
      const notFoundRes = await request(app)
        .get("/api/v1/orders/00000000-0000-4000-8000-000000009999")
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(notFoundRes.status).toBe(404);
      expect(notFoundRes.body.error.stack).toBeUndefined();
    });
  });

  // ========================================================
  // 3. Role-Based Permission Matrix
  // ========================================================
  describe("Role-Based Permission Matrix across Endpoints", () => {
    // A. Team Management (Owner only)
    describe("Team Endpoints (/api/v1/team)", () => {
      it("allowed for Owner", async () => {
        const res = await request(app)
          .get("/api/v1/team")
          .set("Authorization", `Bearer ${tokensA.owner}`);
        expect(res.status).toBe(200);
      });

      it("denied for Manager (403 FORBIDDEN)", async () => {
        const res = await request(app)
          .get("/api/v1/team")
          .set("Authorization", `Bearer ${tokensA.manager}`);
        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
      });

      it("denied for Chef (403 FORBIDDEN)", async () => {
        const res = await request(app)
          .get("/api/v1/team")
          .set("Authorization", `Bearer ${tokensA.chef}`);
        expect(res.status).toBe(403);
      });

      it("denied for Rider (403 FORBIDDEN)", async () => {
        const res = await request(app)
          .get("/api/v1/team")
          .set("Authorization", `Bearer ${tokensA.rider}`);
        expect(res.status).toBe(403);
      });
    });

    // B. Settings (Owner only)
    describe("Settings Endpoints (/api/v1/settings)", () => {
      it("allowed for Owner", async () => {
        const res = await request(app)
          .get("/api/v1/settings")
          .set("Authorization", `Bearer ${tokensA.owner}`);
        expect(res.status).toBe(200);
      });

      it("denied for Manager, Chef, Rider (403 FORBIDDEN)", async () => {
        for (const token of [tokensA.manager, tokensA.chef, tokensA.rider]) {
          const res = await request(app)
            .get("/api/v1/settings")
            .set("Authorization", `Bearer ${token}`);
          expect(res.status).toBe(403);
          expect(res.body.error.code).toBe("FORBIDDEN");
        }
      });
    });

    // C. Analytics (Owner only)
    describe("Analytics Endpoints (/api/v1/analytics/summary)", () => {
      it("allowed for Owner", async () => {
        const res = await request(app)
          .get("/api/v1/analytics/summary")
          .set("Authorization", `Bearer ${tokensA.owner}`);
        expect(res.status).toBe(200);
      });

      it("denied for Manager, Chef, Rider (403 FORBIDDEN)", async () => {
        for (const token of [tokensA.manager, tokensA.chef, tokensA.rider]) {
          const res = await request(app)
            .get("/api/v1/analytics/summary")
            .set("Authorization", `Bearer ${token}`);
          expect(res.status).toBe(403);
          expect(res.body.error.code).toBe("FORBIDDEN");
        }
      });
    });

    // D. Menu Management (Owner & Manager)
    describe("Menu Endpoints (/api/v1/menu)", () => {
      it("allowed for Owner and Manager", async () => {
        const resOwner = await request(app)
          .get("/api/v1/menu/categories")
          .set("Authorization", `Bearer ${tokensA.owner}`);
        expect(resOwner.status).toBe(200);

        const resMgr = await request(app)
          .get("/api/v1/menu/categories")
          .set("Authorization", `Bearer ${tokensA.manager}`);
        expect(resMgr.status).toBe(200);
      });

      it("denied for Chef and Rider (403 FORBIDDEN)", async () => {
        for (const token of [tokensA.chef, tokensA.rider]) {
          const res = await request(app)
            .get("/api/v1/menu/categories")
            .set("Authorization", `Bearer ${token}`);
          expect(res.status).toBe(403);
          expect(res.body.error.code).toBe("FORBIDDEN");
        }
      });
    });

    // E. Orders Payment Status (Owner & Manager only)
    describe("Order Payment Status (/api/v1/orders/:id/payment)", () => {
      it("denied for Chef and Rider (403 FORBIDDEN)", async () => {
        for (const token of [tokensA.chef, tokensA.rider]) {
          const res = await request(app)
            .patch(`/api/v1/orders/${FIXTURE_HOTEL_A.order.id}/payment`)
            .set("Authorization", `Bearer ${token}`)
            .send({ payment_status: "verified" });
          expect(res.status).toBe(403);
          expect(res.body.error.code).toBe("FORBIDDEN");
        }
      });
    });

    // F. Status Transition Constraints for Chef and Rider
    describe("Order Status Transitions (Role Constraints)", () => {
      it("Chef is forbidden from moving PENDING -> ACCEPTED or READY -> DELIVERED", async () => {
        // Create an order in ACCEPTED status for chef to advance
        const acceptedOrder = await prisma.order.create({
          data: {
            restaurant_id: FIXTURE_HOTEL_A.id,
            customer_id: FIXTURE_HOTEL_A.customer.id,
            number: "3001",
            type: OrderType.delivery,
            status: OrderStatus.ACCEPTED,
            payment_method: PaymentMethod.cod,
            payment_status: PaymentStatus.pending,
            subtotal: 10000,
            delivery_fee: 15000,
            total: 25000,
          },
        });

        // Chef moves ACCEPTED -> PREPARING (allowed)
        const chefPrepRes = await request(app)
          .patch(`/api/v1/orders/${acceptedOrder.id}/status`)
          .set("Authorization", `Bearer ${tokensA.chef}`)
          .send({ status: "PREPARING" });
        expect(chefPrepRes.status).toBe(200);

        // Chef tries invalid transition (PREPARING -> CANCELLED, chef not allowed to cancel)
        const chefCancelRes = await request(app)
          .patch(`/api/v1/orders/${acceptedOrder.id}/status`)
          .set("Authorization", `Bearer ${tokensA.chef}`)
          .send({ status: "CANCELLED" });
        expect(chefCancelRes.status).toBe(403);

        await prisma.orderEvent.deleteMany({ where: { order_id: acceptedOrder.id } });
        await prisma.order.delete({ where: { id: acceptedOrder.id } });
      });
    });
  });
});
