import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";
import { prisma } from "../config/prisma";
import {
  FIXTURE_HOTEL_A,
  FIXTURE_HOTEL_B,
  tokensA,
  tokensB,
} from "../test/multiTenantFixture";

describe("Multi-Tenant Isolation Verification (Hotel A vs Hotel B)", () => {

  // ========================================================
  // 1. Auth & Identity (/api/v1/auth/me)
  // ========================================================
  describe("GET /api/v1/auth/me", () => {
    it("returns Hotel A's details for user A and Hotel B's details for user B", async () => {
      const resA = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${tokensA.owner}`);
      expect(resA.status).toBe(200);
      expect(resA.body.data.restaurant.id).toBe(FIXTURE_HOTEL_A.id);
      expect(resA.body.data.restaurant.name).toBe(FIXTURE_HOTEL_A.name);

      const resB = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${tokensB.owner}`);
      expect(resB.status).toBe(200);
      expect(resB.body.data.restaurant.id).toBe(FIXTURE_HOTEL_B.id);
      expect(resB.body.data.restaurant.name).toBe(FIXTURE_HOTEL_B.name);
    });

    it("ignores restaurantId passed in query or body (token always wins)", async () => {
      const res = await request(app)
        .get(`/api/v1/auth/me?restaurantId=${FIXTURE_HOTEL_B.id}`)
        .set("Authorization", `Bearer ${tokensA.owner}`);
      expect(res.status).toBe(200);
      expect(res.body.data.restaurant.id).toBe(FIXTURE_HOTEL_A.id);
    });
  });

  // ========================================================
  // 2. Orders Isolation (/api/v1/orders)
  // ========================================================
  describe("Orders Isolation (/api/v1/orders)", () => {
    it("Hotel A listing never returns Hotel B orders, even with poisoned query param", async () => {
      const res = await request(app)
        .get(`/api/v1/orders?restaurant_id=${FIXTURE_HOTEL_B.id}`)
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((o: { restaurant_id: string }) => o.restaurant_id === FIXTURE_HOTEL_A.id)).toBe(true);
      expect(res.body.data.some((o: { id: string }) => o.id === FIXTURE_HOTEL_B.order.id)).toBe(false);
    });

    it("Hotel A user cannot read Hotel B order by guessed ID (returns 404 NOT_FOUND)", async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${FIXTURE_HOTEL_B.order.id}`)
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("Hotel A user cannot update status of Hotel B order (returns 404 NOT_FOUND)", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${FIXTURE_HOTEL_B.order.id}/status`)
        .set("Authorization", `Bearer ${tokensA.owner}`)
        .send({ status: "ACCEPTED" });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");

      // Verify Hotel B order status remained unchanged
      const check = await prisma.order.findUnique({ where: { id: FIXTURE_HOTEL_B.order.id } });
      expect(check?.status).toBe("PENDING");
    });

    it("Hotel A user cannot update payment of Hotel B order (returns 404 NOT_FOUND)", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${FIXTURE_HOTEL_B.order.id}/payment`)
        .set("Authorization", `Bearer ${tokensA.owner}`)
        .send({ payment_status: "verified" });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");

      const check = await prisma.order.findUnique({ where: { id: FIXTURE_HOTEL_B.order.id } });
      expect(check?.payment_status).toBe("pending");
    });
  });

  // ========================================================
  // 3. Menu Categories Isolation (/api/v1/menu/categories)
  // ========================================================
  describe("Menu Categories Isolation (/api/v1/menu/categories)", () => {
    it("Hotel A listing never returns Hotel B categories", async () => {
      const res = await request(app)
        .get("/api/v1/menu/categories")
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((c: { restaurant_id: string }) => c.restaurant_id === FIXTURE_HOTEL_A.id)).toBe(true);
      expect(res.body.data.some((c: { id: string }) => c.id === FIXTURE_HOTEL_B.category.id)).toBe(false);
    });

    it("Hotel A user cannot read Hotel B category by ID (returns 404 NOT_FOUND)", async () => {
      const res = await request(app)
        .get(`/api/v1/menu/categories/${FIXTURE_HOTEL_B.category.id}`)
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("Hotel A user cannot update Hotel B category (returns 404 NOT_FOUND)", async () => {
      const res = await request(app)
        .patch(`/api/v1/menu/categories/${FIXTURE_HOTEL_B.category.id}`)
        .set("Authorization", `Bearer ${tokensA.owner}`)
        .send({
          translations: [{ language: "en", name: "Malicious Category Rename" }],
        });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");

      const check = await prisma.menuTranslation.findFirst({
        where: { entity_id: FIXTURE_HOTEL_B.category.id, language: "en" },
      });
      expect(check?.name).toBe(FIXTURE_HOTEL_B.category.name);
    });

    it("Hotel A user cannot delete Hotel B category (returns 404 NOT_FOUND)", async () => {
      const res = await request(app)
        .delete(`/api/v1/menu/categories/${FIXTURE_HOTEL_B.category.id}`)
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");

      const check = await prisma.menuCategory.findUnique({ where: { id: FIXTURE_HOTEL_B.category.id } });
      expect(check).not.toBeNull();
    });

    it("Hotel A reordering Hotel B category ID is ignored and does not affect Hotel B", async () => {
      const res = await request(app)
        .patch("/api/v1/menu/categories/reorder")
        .set("Authorization", `Bearer ${tokensA.owner}`)
        .send({
          items: [{ id: FIXTURE_HOTEL_B.category.id, sort_order: 999 }],
        });

      expect(res.status).toBe(200);

      const checkB = await prisma.menuCategory.findUnique({ where: { id: FIXTURE_HOTEL_B.category.id } });
      expect(checkB?.sort_order).toBe(1); // Unchanged
    });
  });

  // ========================================================
  // 4. Menu Items Isolation (/api/v1/menu/items)
  // ========================================================
  describe("Menu Items Isolation (/api/v1/menu/items)", () => {
    it("Hotel A listing never returns Hotel B items", async () => {
      const res = await request(app)
        .get("/api/v1/menu/items")
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((i: { restaurant_id: string }) => i.restaurant_id === FIXTURE_HOTEL_A.id)).toBe(true);
      expect(res.body.data.some((i: { id: string }) => i.id === FIXTURE_HOTEL_B.item.id)).toBe(false);
    });

    it("Hotel A user cannot read Hotel B item by ID (returns 404 NOT_FOUND)", async () => {
      const res = await request(app)
        .get(`/api/v1/menu/items/${FIXTURE_HOTEL_B.item.id}`)
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("Hotel A user cannot create an item linked to Hotel B's category", async () => {
      const res = await request(app)
        .post("/api/v1/menu/items")
        .set("Authorization", `Bearer ${tokensA.owner}`)
        .send({
          category_id: FIXTURE_HOTEL_B.category.id,
          price: 50000,
          translations: [{ language: "en", name: "Infiltrator Item" }],
        });

      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain("Category not found for this restaurant");
    });

    it("Hotel A user cannot update Hotel B item (returns 404 NOT_FOUND)", async () => {
      const res = await request(app)
        .patch(`/api/v1/menu/items/${FIXTURE_HOTEL_B.item.id}`)
        .set("Authorization", `Bearer ${tokensA.owner}`)
        .send({ price: 100 });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");

      const check = await prisma.menuItem.findUnique({ where: { id: FIXTURE_HOTEL_B.item.id } });
      expect(check?.price).toBe(FIXTURE_HOTEL_B.item.price);
    });

    it("Hotel A user cannot toggle availability of Hotel B item (returns 404 NOT_FOUND)", async () => {
      const res = await request(app)
        .patch(`/api/v1/menu/items/${FIXTURE_HOTEL_B.item.id}/availability`)
        .set("Authorization", `Bearer ${tokensA.owner}`)
        .send({ is_available: false });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");

      const check = await prisma.menuItem.findUnique({ where: { id: FIXTURE_HOTEL_B.item.id } });
      expect(check?.is_available).toBe(true);
    });

    it("Hotel A user cannot delete Hotel B item (returns 404 NOT_FOUND)", async () => {
      const res = await request(app)
        .delete(`/api/v1/menu/items/${FIXTURE_HOTEL_B.item.id}`)
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");

      const check = await prisma.menuItem.findUnique({ where: { id: FIXTURE_HOTEL_B.item.id } });
      expect(check).not.toBeNull();
    });
  });

  // ========================================================
  // 5. Team Isolation (/api/v1/team)
  // ========================================================
  describe("Team Isolation (/api/v1/team)", () => {
    it("Hotel A listing never returns Hotel B team members", async () => {
      const res = await request(app)
        .get("/api/v1/team")
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((u: { restaurant_id: string }) => u.restaurant_id === FIXTURE_HOTEL_A.id)).toBe(true);
      expect(res.body.data.some((u: { id: string }) => u.id === FIXTURE_HOTEL_B.users.chef.id)).toBe(false);
    });

    it("Hotel A owner cannot read Hotel B team member by ID (returns 404 NOT_FOUND)", async () => {
      const res = await request(app)
        .get(`/api/v1/team/${FIXTURE_HOTEL_B.users.chef.id}`)
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("Hotel A owner cannot update Hotel B team member (returns 404 NOT_FOUND)", async () => {
      const res = await request(app)
        .patch(`/api/v1/team/${FIXTURE_HOTEL_B.users.chef.id}`)
        .set("Authorization", `Bearer ${tokensA.owner}`)
        .send({ name: "Renamed Chef" });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");

      const check = await prisma.user.findUnique({ where: { id: FIXTURE_HOTEL_B.users.chef.id } });
      expect(check?.name).toBe(FIXTURE_HOTEL_B.users.chef.name);
    });

    it("Hotel A owner cannot deactivate Hotel B team member (returns 404 NOT_FOUND)", async () => {
      const res = await request(app)
        .delete(`/api/v1/team/${FIXTURE_HOTEL_B.users.chef.id}`)
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");

      const check = await prisma.user.findUnique({ where: { id: FIXTURE_HOTEL_B.users.chef.id } });
      expect(check?.is_active).toBe(true);
    });

    it("Hotel A creating team member with injected restaurantId always assigns to Hotel A", async () => {
      const testEmail = "injected_hotel_test@demo.local";
      const res = await request(app)
        .post("/api/v1/team")
        .set("Authorization", `Bearer ${tokensA.owner}`)
        .send({
          restaurant_id: FIXTURE_HOTEL_B.id, // Injected attempt
          name: "Injected User",
          email: testEmail,
          password: "TempPassword123!",
          role: "chef",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.restaurant_id).toBe(FIXTURE_HOTEL_A.id); // Assigned to A, never B

      await prisma.user.delete({ where: { email: testEmail } });
    });
  });

  // ========================================================
  // 6. Settings Isolation (/api/v1/settings)
  // ========================================================
  describe("Settings Isolation (/api/v1/settings)", () => {
    it("Hotel A owner gets Hotel A settings, never Hotel B", async () => {
      const res = await request(app)
        .get("/api/v1/settings")
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(FIXTURE_HOTEL_A.id);
      expect(res.body.data.name).toBe(FIXTURE_HOTEL_A.name);
    });

    it("Hotel A owner updating settings never touches Hotel B settings", async () => {
      const res = await request(app)
        .patch("/api/v1/settings")
        .set("Authorization", `Bearer ${tokensA.owner}`)
        .send({
          delivery_area: "Exclusive Alpha Area",
          restaurant_id: FIXTURE_HOTEL_B.id, // Poisoned parameter
        });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(FIXTURE_HOTEL_A.id);
      expect(res.body.data.delivery_area).toBe("Exclusive Alpha Area");

      // Verify Hotel B remains untouched
      const checkB = await prisma.restaurant.findUnique({ where: { id: FIXTURE_HOTEL_B.id } });
      expect(checkB?.delivery_area).toBeNull();
    });
  });

  // ========================================================
  // 7. Analytics Isolation (/api/v1/analytics/summary)
  // ========================================================
  describe("Analytics Isolation (/api/v1/analytics/summary)", () => {
    it("Hotel A owner receives only Hotel A's analytics metrics", async () => {
      const resA = await request(app)
        .get("/api/v1/analytics/summary?range=today")
        .set("Authorization", `Bearer ${tokensA.owner}`);

      expect(resA.status).toBe(200);
      // Hotel A has 1 test order with total 60000
      expect(resA.body.data.totalSales).toBe(60000);
      expect(resA.body.data.orderCount).toBe(1);

      const resB = await request(app)
        .get("/api/v1/analytics/summary?range=today")
        .set("Authorization", `Bearer ${tokensB.owner}`);

      expect(resB.status).toBe(200);
      // Hotel B has 1 test order with total 105000
      expect(resB.body.data.totalSales).toBe(105000);
      expect(resB.body.data.orderCount).toBe(1);
    });
  });
});
