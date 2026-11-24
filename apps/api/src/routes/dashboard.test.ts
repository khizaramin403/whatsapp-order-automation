import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { Role } from "@prisma/client";
import { CacheService } from "../services/cache.service";

describe("Dashboard APIs (Menu, Team, Settings, Analytics)", () => {
  const RESTAURANT_ID = "00000000-0000-4000-8000-000000000001";
  const OTHER_RESTAURANT_ID = "00000000-0000-4000-8000-000000000099";

  const ownerToken = jwt.sign(
    { userId: "00000000-0000-4000-8000-000000000011", restaurantId: RESTAURANT_ID, role: Role.owner },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const managerToken = jwt.sign(
    { userId: "00000000-0000-4000-8000-000000000012", restaurantId: RESTAURANT_ID, role: Role.manager },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const chefToken = jwt.sign(
    { userId: "00000000-0000-4000-8000-000000000013", restaurantId: RESTAURANT_ID, role: Role.chef },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const riderToken = jwt.sign(
    { userId: "00000000-0000-4000-8000-000000000014", restaurantId: RESTAURANT_ID, role: Role.rider },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const otherHotelToken = jwt.sign(
    { userId: "00000000-0000-4000-8000-000000000099", restaurantId: OTHER_RESTAURANT_ID, role: Role.owner },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const cleanupUserEmails: string[] = [];
  const cleanupCategoryIds: string[] = [];
  const cleanupItemIds: string[] = [];

  afterAll(async () => {
    if (cleanupUserEmails.length > 0) {
      await prisma.user.deleteMany({ where: { email: { in: cleanupUserEmails } } });
    }
    if (cleanupItemIds.length > 0) {
      await prisma.menuTranslation.deleteMany({ where: { entity_id: { in: cleanupItemIds } } });
      await prisma.menuItem.deleteMany({ where: { id: { in: cleanupItemIds } } });
    }
    if (cleanupCategoryIds.length > 0) {
      await prisma.menuTranslation.deleteMany({ where: { entity_id: { in: cleanupCategoryIds } } });
      await prisma.menuCategory.deleteMany({ where: { id: { in: cleanupCategoryIds } } });
    }
    // Clean cache
    await CacheService.delPattern(`cache:*:${RESTAURANT_ID}`);
  });

  // ==========================================
  // 1. Menu Management (/api/v1/menu)
  // ==========================================
  describe("Menu Management (/api/v1/menu)", () => {
    let createdCatId: string;
    let createdItemId: string;

    it("allows owner and manager to list categories", async () => {
      const res = await request(app)
        .get("/api/v1/menu/categories")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty("translations");
    });

    it("forbids chef and rider from category endpoints", async () => {
      const resChef = await request(app)
        .get("/api/v1/menu/categories")
        .set("Authorization", `Bearer ${chefToken}`);
      expect(resChef.status).toBe(403);

      const resRider = await request(app)
        .get("/api/v1/menu/categories")
        .set("Authorization", `Bearer ${riderToken}`);
      expect(resRider.status).toBe(403);
    });

    it("creates a new category with translations and invalidates cache", async () => {
      const res = await request(app)
        .post("/api/v1/menu/categories")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          sort_order: 99,
          translations: [
            { language: "en", name: "Chef Specials", description: "Exclusive signature dishes" },
            { language: "ar", name: "أطباق الشيف الخاصة", description: "أطباق حصرية مميزة" },
            { language: "ur-Latn", name: "Chef ki Khaas Dishain", description: "Khaas pakwan" },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.translations.length).toBe(3);
      createdCatId = res.body.data.id;
      cleanupCategoryIds.push(createdCatId);
    });

    it("reorders categories", async () => {
      const res = await request(app)
        .patch("/api/v1/menu/categories/reorder")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          items: [{ id: createdCatId, sort_order: 10 }],
        });

      expect(res.status).toBe(200);
      const updated = res.body.data.find((c: { id: string }) => c.id === createdCatId);
      expect(updated.sort_order).toBe(10);
    });

    it("creates a new menu item with translations", async () => {
      const res = await request(app)
        .post("/api/v1/menu/items")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          category_id: createdCatId,
          price: 185000, // Rs 1,850.00
          image_url: "/images/special.jpg",
          is_available: true,
          translations: [
            { language: "en", name: "Signature Mutton Shank", description: "Slow-braised shank", aliases: ["shank", "mutton"] },
            { language: "ar", name: "موزة لحم ضأن مميزة", description: "موزة ضأن مطهوة ببطء", aliases: ["موزة"] },
            { language: "ur-Latn", name: "Khaas Mutton Machli", description: "Dheemi aanch par paki", aliases: ["machli", "shank"] },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.price).toBe(185000);
      expect(res.body.data.translations.length).toBe(3);
      createdItemId = res.body.data.id;
      cleanupItemIds.push(createdItemId);
    });

    it("lists items with pagination (20/page) and search", async () => {
      const res = await request(app)
        .get(`/api/v1/menu/items?category_id=${createdCatId}&search=Shank`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.meta.total).toBe(1);
      expect(res.body.data[0].id).toBe(createdItemId);
    });

    it("toggles item availability on and off via PATCH /menu/items/:id/availability", async () => {
      // Toggle to false
      const resOff = await request(app)
        .patch(`/api/v1/menu/items/${createdItemId}/availability`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send({ is_available: false });

      expect(resOff.status).toBe(200);
      expect(resOff.body.data.is_available).toBe(false);

      // Toggle to true
      const resOn = await request(app)
        .patch(`/api/v1/menu/items/${createdItemId}/availability`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send({ is_available: true });

      expect(resOn.status).toBe(200);
      expect(resOn.body.data.is_available).toBe(true);
    });

    it("deletes a menu item and its translations", async () => {
      const res = await request(app)
        .delete(`/api/v1/menu/items/${createdItemId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.success).toBe(true);

      const check = await prisma.menuItem.findUnique({ where: { id: createdItemId } });
      expect(check).toBeNull();
    });
  });

  // ==========================================
  // 2. Team Management (/api/v1/team)
  // ==========================================
  describe("Team Management (/api/v1/team)", () => {
    let createdStaffId: string;
    const testStaffEmail = "new_chef_test@demo.local";

    it("allows owner to list team members with pagination", async () => {
      const res = await request(app)
        .get("/api/v1/team")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThanOrEqual(4);
    });

    it("forbids manager, chef, and rider from accessing team endpoints", async () => {
      const resMgr = await request(app)
        .get("/api/v1/team")
        .set("Authorization", `Bearer ${managerToken}`);
      expect(resMgr.status).toBe(403);

      const resChef = await request(app)
        .get("/api/v1/team")
        .set("Authorization", `Bearer ${chefToken}`);
      expect(resChef.status).toBe(403);
    });

    it("creates a new staff member with hashed temporary password", async () => {
      cleanupUserEmails.push(testStaffEmail);

      const res = await request(app)
        .post("/api/v1/team")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Test Junior Chef",
          email: testStaffEmail,
          password: "TempPassword123!",
          role: "chef",
          language: "ur-Latn",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.role).toBe("chef");
      expect(res.body.data.is_active).toBe(true);
      expect(res.body.data.password_hash).toBeUndefined(); // Never leak password hash
      createdStaffId = res.body.data.id;
    });

    it("prevents changing own role or deactivating oneself", async () => {
      // Owner tries to change own role to manager
      const resRole = await request(app)
        .patch("/api/v1/team/00000000-0000-4000-8000-000000000011")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ role: "manager" });

      expect(resRole.status).toBe(403);
      expect(resRole.body.error.message).toContain("cannot change your own role");

      // Owner tries to deactivate oneself
      const resDeact = await request(app)
        .delete("/api/v1/team/00000000-0000-4000-8000-000000000011")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(resDeact.status).toBe(403);
      expect(resDeact.body.error.message).toContain("cannot deactivate your own account");
    });

    it("deactivates instead of deleting a staff member", async () => {
      const res = await request(app)
        .delete(`/api/v1/team/${createdStaffId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.is_active).toBe(false);

      const check = await prisma.user.findUnique({ where: { id: createdStaffId } });
      expect(check).not.toBeNull();
      expect(check?.is_active).toBe(false);
    });

    it("enforces tenant isolation: owner cannot manage users of another hotel", async () => {
      const res = await request(app)
        .get(`/api/v1/team/${createdStaffId}`)
        .set("Authorization", `Bearer ${otherHotelToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 3. Settings (/api/v1/settings)
  // ==========================================
  describe("Settings Management (/api/v1/settings)", () => {
    it("returns hotel settings for owner and caches in Redis", async () => {
      const res = await request(app)
        .get("/api/v1/settings")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(RESTAURANT_ID);
      expect(res.body.data.name).toBe("Grand Continental Hotel & Suites");
      expect(res.body.data.currency).toBe("PKR");
      expect(res.body.data.delivery_fee).toBe(15000);

      // Verify cached in Redis
      const cached = await CacheService.get<{ id: string }>(`cache:settings:${RESTAURANT_ID}`);
      expect(cached).not.toBeNull();
      expect(cached?.id).toBe(RESTAURANT_ID);
    });

    it("forbids manager and chef from accessing settings", async () => {
      const resMgr = await request(app)
        .get("/api/v1/settings")
        .set("Authorization", `Bearer ${managerToken}`);
      expect(resMgr.status).toBe(403);

      const resChef = await request(app)
        .get("/api/v1/settings")
        .set("Authorization", `Bearer ${chefToken}`);
      expect(resChef.status).toBe(403);
    });

    it("updates hotel settings and invalidates cache", async () => {
      const res = await request(app)
        .patch("/api/v1/settings")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          delivery_area: "DHA, Gulberg, Model Town, Cantt",
          minimum_order: 50000, // Rs 500.00
          sound_notifications: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.delivery_area).toBe("DHA, Gulberg, Model Town, Cantt");
      expect(res.body.data.minimum_order).toBe(50000);
      expect(res.body.data.sound_notifications).toBe(false);

      // Verify cache was invalidated
      const cached = await CacheService.get<{ id: string }>(`cache:settings:${RESTAURANT_ID}`);
      expect(cached).toBeNull();
    });
  });

  // ==========================================
  // 4. Analytics (/api/v1/analytics/summary)
  // ==========================================
  describe("Analytics Summary (/api/v1/analytics/summary)", () => {
    it("returns SQL-aggregated analytics summary for owner (range=today)", async () => {
      const res = await request(app)
        .get("/api/v1/analytics/summary?range=today")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.range).toBe("today");
      expect(typeof data.totalSales).toBe("number");
      expect(typeof data.orderCount).toBe("number");
      expect(typeof data.averageOrderValue).toBe("number");
      expect(typeof data.codShare).toBe("number");
      expect(Array.isArray(data.ordersPerHour)).toBe(true);
      expect(Array.isArray(data.salesOverTime)).toBe(true);
      expect(Array.isArray(data.paymentSplit)).toBe(true);
      expect(Array.isArray(data.topItems)).toBe(true);
    });

    it("supports 7d and 30d ranges", async () => {
      const res7d = await request(app)
        .get("/api/v1/analytics/summary?range=7d")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res7d.status).toBe(200);
      expect(res7d.body.data.range).toBe("7d");
      expect(res7d.body.data.orderCount).toBeGreaterThan(0);
      expect(res7d.body.data.totalSales).toBeGreaterThan(0);

      const res30d = await request(app)
        .get("/api/v1/analytics/summary?range=30d")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res30d.status).toBe(200);
      expect(res30d.body.data.range).toBe("30d");
    });

    it("forbids manager, chef, and rider from accessing analytics", async () => {
      const resMgr = await request(app)
        .get("/api/v1/analytics/summary")
        .set("Authorization", `Bearer ${managerToken}`);
      expect(resMgr.status).toBe(403);

      const resChef = await request(app)
        .get("/api/v1/analytics/summary")
        .set("Authorization", `Bearer ${chefToken}`);
      expect(resChef.status).toBe(403);
    });
  });
});
