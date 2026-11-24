import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { OrderStatus, OrderType, PaymentMethod, PaymentStatus, Role } from "@prisma/client";
import { orderService } from "../services/order.service";

describe("Orders API & Service Layer", () => {
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

  const createdOrderIds: string[] = [];

  // Helper to create a test order in a specific status and type
  async function createTestOrder(opts: {
    status?: OrderStatus;
    type?: OrderType;
    payment_method?: PaymentMethod;
    payment_status?: PaymentStatus;
    restaurant_id?: string;
  } = {}) {
    const cust = await prisma.customer.findFirst({
      where: { restaurant_id: opts.restaurant_id || RESTAURANT_ID },
    });
    const item = await prisma.menuItem.findFirst({
      where: { restaurant_id: opts.restaurant_id || RESTAURANT_ID },
    });

    const testNum = "99" + Math.floor(1000 + Math.random() * 9000).toString();

    const order = await prisma.order.create({
      data: {
        restaurant_id: opts.restaurant_id || RESTAURANT_ID,
        customer_id: cust!.id,
        number: testNum,
        type: opts.type || OrderType.delivery,
        status: opts.status || OrderStatus.PENDING,
        payment_method: opts.payment_method || PaymentMethod.cod,
        payment_status: opts.payment_status || PaymentStatus.pending,
        subtotal: 10000,
        delivery_fee: 15000,
        total: 25000,
        address: "123 Test Street, Lahore",
        items: {
          create: {
            restaurant_id: opts.restaurant_id || RESTAURANT_ID,
            menu_item_id: item!.id,
            name_snapshot: "Test Biryani Snapshot",
            price_snapshot: 10000,
            qty: 1,
          },
        },
        events: {
          create: {
            restaurant_id: opts.restaurant_id || RESTAURANT_ID,
            status: opts.status || OrderStatus.PENDING,
            by_user_id: null,
            note: "Order created for testing",
          },
        },
      },
    });

    createdOrderIds.push(order.id);
    return order;
  }

  afterAll(async () => {
    if (createdOrderIds.length > 0) {
      await prisma.orderEvent.deleteMany({ where: { order_id: { in: createdOrderIds } } });
      await prisma.orderItem.deleteMany({ where: { order_id: { in: createdOrderIds } } });
      await prisma.paymentProof.deleteMany({ where: { order_id: { in: createdOrderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });
    }
  });

  describe("GET /api/v1/orders", () => {
    it("returns paginated list of orders with meta", async () => {
      const res = await request(app)
        .get("/api/v1/orders?page=1&pageSize=10")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(10);
      expect(res.body).toHaveProperty("meta");
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.pageSize).toBe(10);
      expect(typeof res.body.meta.total).toBe("number");
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it("filters orders by status", async () => {
      const res = await request(app)
        .get("/api/v1/orders?status=PENDING")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((o: { status: string }) => o.status === "PENDING")).toBe(true);
    });

    it("filters orders by payment_method", async () => {
      const res = await request(app)
        .get("/api/v1/orders?payment_method=online")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((o: { payment_method: string }) => o.payment_method === "online")).toBe(true);
    });

    it("filters orders by type", async () => {
      const res = await request(app)
        .get("/api/v1/orders?type=dine_in")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((o: { type: string }) => o.type === "dine_in")).toBe(true);
    });

    it("searches orders by order number or customer name", async () => {
      const res = await request(app)
        .get("/api/v1/orders?search=1001")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some((o: { number: string }) => o.number === "1001")).toBe(true);
    });

    it("enforces tenant isolation and returns empty list for hotel with no orders", async () => {
      const res = await request(app)
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${otherHotelToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });

    it("rejects unauthenticated requests", async () => {
      const res = await request(app).get("/api/v1/orders");
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHENTICATED");
    });
  });

  describe("GET /api/v1/orders/:id", () => {
    it("returns full order details for owner/manager", async () => {
      const testOrder = await createTestOrder({ status: OrderStatus.PENDING });

      const res = await request(app)
        .get(`/api/v1/orders/${testOrder.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testOrder.id);
      expect(res.body.data).toHaveProperty("items");
      expect(res.body.data).toHaveProperty("customer");
      expect(res.body.data).toHaveProperty("events");
      expect(res.body.data).toHaveProperty("payment_proofs");
      expect(res.body.data.customer.phone).toBeDefined();
      expect(res.body.data.total).toBe(25000);
    });

    it("returns 404 for nonexistent order ID", async () => {
      const res = await request(app)
        .get("/api/v1/orders/00000000-0000-4000-8000-000000009999")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("returns 404 if order belongs to a different restaurant (tenant isolation)", async () => {
      const testOrder = await createTestOrder({ status: OrderStatus.PENDING });

      const res = await request(app)
        .get(`/api/v1/orders/${testOrder.id}`)
        .set("Authorization", `Bearer ${otherHotelToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("Response shaping by role (data protection)", () => {
    it("shapes response for CHEF: only number, status, type, items and quantities, notes and times; NO customer phone, NO address, NO payment info", async () => {
      const testOrder = await createTestOrder({ status: OrderStatus.ACCEPTED, type: OrderType.delivery });

      const res = await request(app)
        .get(`/api/v1/orders/${testOrder.id}`)
        .set("Authorization", `Bearer ${chefToken}`);

      expect(res.status).toBe(200);
      const data = res.body.data;

      // Allowed fields
      expect(data.id).toBe(testOrder.id);
      expect(data.number).toBe(testOrder.number);
      expect(data.status).toBe("ACCEPTED");
      expect(data.type).toBe("delivery");
      expect(data.items).toBeDefined();
      expect(data.items[0]).toHaveProperty("name_snapshot");
      expect(data.items[0]).toHaveProperty("qty");
      expect(data.events).toBeDefined();

      // STRICTLY FORBIDDEN FOR CHEF
      expect(data.customer).toBeUndefined();
      expect(data.address).toBeUndefined();
      expect(data.total).toBeUndefined();
      expect(data.subtotal).toBeUndefined();
      expect(data.delivery_fee).toBeUndefined();
      expect(data.payment_method).toBeUndefined();
      expect(data.payment_status).toBeUndefined();
      expect(data.payment_proofs).toBeUndefined();
      expect(data.items[0].price_snapshot).toBeUndefined();
    });

    it("shapes response for RIDER: address, customer name & phone, cash_to_collect only for COD orders; NO payment proof", async () => {
      // COD delivery order
      const codOrder = await createTestOrder({
        status: OrderStatus.READY,
        type: OrderType.delivery,
        payment_method: PaymentMethod.cod,
      });

      const resCod = await request(app)
        .get(`/api/v1/orders/${codOrder.id}`)
        .set("Authorization", `Bearer ${riderToken}`);

      expect(resCod.status).toBe(200);
      const dataCod = resCod.body.data;
      expect(dataCod.address).toBe("123 Test Street, Lahore");
      expect(dataCod.customer.name).toBeDefined();
      expect(dataCod.customer.phone).toBeDefined();
      expect(dataCod.cash_to_collect).toBe(codOrder.total);
      expect(dataCod.payment_proofs).toBeUndefined();

      // Online delivery order: cash_to_collect must be 0
      const onlineOrder = await createTestOrder({
        status: OrderStatus.READY,
        type: OrderType.delivery,
        payment_method: PaymentMethod.online,
        payment_status: PaymentStatus.verified,
      });

      const resOnline = await request(app)
        .get(`/api/v1/orders/${onlineOrder.id}`)
        .set("Authorization", `Bearer ${riderToken}`);

      expect(resOnline.status).toBe(200);
      const dataOnline = resOnline.body.data;
      expect(dataOnline.cash_to_collect).toBe(0);
      expect(dataOnline.payment_proofs).toBeUndefined();
    });
  });

  describe("PATCH /api/v1/orders/:id/status (Transitions & Role limits)", () => {
    it("owner transitions PENDING -> ACCEPTED and records timeline event", async () => {
      const testOrder = await createTestOrder({ status: OrderStatus.PENDING });

      const res = await request(app)
        .patch(`/api/v1/orders/${testOrder.id}/status`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ status: "ACCEPTED", note: "Order accepted by owner" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("ACCEPTED");

      // Verify event was appended to order_events
      const events = await prisma.orderEvent.findMany({
        where: { order_id: testOrder.id },
        orderBy: { created_at: "asc" },
      });
      const lastEvent = events[events.length - 1];
      expect(lastEvent.status).toBe("ACCEPTED");
      expect(lastEvent.by_user_id).toBe("00000000-0000-4000-8000-000000000011");
      expect(lastEvent.note).toBe("Order accepted by owner");
    });

    it("rejects invalid transition with ORDER_INVALID_TRANSITION", async () => {
      const testOrder = await createTestOrder({ status: OrderStatus.PENDING });

      // Cannot skip straight to DELIVERED
      const res = await request(app)
        .patch(`/api/v1/orders/${testOrder.id}/status`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ status: "DELIVERED" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("ORDER_INVALID_TRANSITION");
    });

    it("allows CHEF to move ACCEPTED -> PREPARING and PREPARING -> READY", async () => {
      const testOrder = await createTestOrder({ status: OrderStatus.ACCEPTED });

      // ACCEPTED -> PREPARING
      const res1 = await request(app)
        .patch(`/api/v1/orders/${testOrder.id}/status`)
        .set("Authorization", `Bearer ${chefToken}`)
        .send({ status: "PREPARING" });

      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe("PREPARING");

      // PREPARING -> READY
      const res2 = await request(app)
        .patch(`/api/v1/orders/${testOrder.id}/status`)
        .set("Authorization", `Bearer ${chefToken}`)
        .send({ status: "READY" });

      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe("READY");
    });

    it("forbids CHEF from other transitions (e.g. PENDING -> ACCEPTED or READY -> OUT_FOR_DELIVERY)", async () => {
      const pendingOrder = await createTestOrder({ status: OrderStatus.PENDING });

      const res = await request(app)
        .patch(`/api/v1/orders/${pendingOrder.id}/status`)
        .set("Authorization", `Bearer ${chefToken}`)
        .send({ status: "ACCEPTED" });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("allows RIDER to move READY -> OUT_FOR_DELIVERY and OUT_FOR_DELIVERY -> DELIVERED for delivery orders", async () => {
      const testOrder = await createTestOrder({ status: OrderStatus.READY, type: OrderType.delivery });

      // READY -> OUT_FOR_DELIVERY
      const res1 = await request(app)
        .patch(`/api/v1/orders/${testOrder.id}/status`)
        .set("Authorization", `Bearer ${riderToken}`)
        .send({ status: "OUT_FOR_DELIVERY" });

      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe("OUT_FOR_DELIVERY");

      // OUT_FOR_DELIVERY -> DELIVERED
      const res2 = await request(app)
        .patch(`/api/v1/orders/${testOrder.id}/status`)
        .set("Authorization", `Bearer ${riderToken}`)
        .send({ status: "DELIVERED" });

      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe("DELIVERED");
    });

    it("forbids RIDER from moving non-delivery orders or other statuses", async () => {
      const dineInOrder = await createTestOrder({ status: OrderStatus.READY, type: OrderType.dine_in });

      const res = await request(app)
        .patch(`/api/v1/orders/${dineInOrder.id}/status`)
        .set("Authorization", `Bearer ${riderToken}`)
        .send({ status: "COMPLETED" });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });
  });

  describe("PATCH /api/v1/orders/:id/payment", () => {
    it("allows OWNER and MANAGER to update payment_status to verified or not_received", async () => {
      const testOrder = await createTestOrder({
        payment_method: PaymentMethod.online,
        payment_status: PaymentStatus.pending_check,
      });

      // Manager verifies
      const res1 = await request(app)
        .patch(`/api/v1/orders/${testOrder.id}/payment`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send({ payment_status: "verified" });

      expect(res1.status).toBe(200);
      expect(res1.body.data.payment_status).toBe("verified");

      // Owner marks not_received
      const res2 = await request(app)
        .patch(`/api/v1/orders/${testOrder.id}/payment`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ payment_status: "not_received" });

      expect(res2.status).toBe(200);
      expect(res2.body.data.payment_status).toBe("not_received");
    });

    it("forbids CHEF and RIDER from updating payment status", async () => {
      const testOrder = await createTestOrder();

      const resChef = await request(app)
        .patch(`/api/v1/orders/${testOrder.id}/payment`)
        .set("Authorization", `Bearer ${chefToken}`)
        .send({ payment_status: "verified" });

      expect(resChef.status).toBe(403);
      expect(resChef.body.error.code).toBe("FORBIDDEN");

      const resRider = await request(app)
        .patch(`/api/v1/orders/${testOrder.id}/payment`)
        .set("Authorization", `Bearer ${riderToken}`)
        .send({ payment_status: "verified" });

      expect(resRider.status).toBe(403);
      expect(resRider.body.error.code).toBe("FORBIDDEN");
    });

    it("rejects invalid payment_status with VALIDATION_ERROR", async () => {
      const testOrder = await createTestOrder();

      const res = await request(app)
        .patch(`/api/v1/orders/${testOrder.id}/payment`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ payment_status: "pending" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("Internal createOrder function (Service layer & Transaction)", () => {
    it("atomically creates order, item snapshots and initial timeline event", async () => {
      const customer = await prisma.customer.findFirst({
        where: { restaurant_id: RESTAURANT_ID },
      });
      const items = await prisma.menuItem.findMany({
        where: { restaurant_id: RESTAURANT_ID, is_available: true },
        take: 2,
      });

      expect(customer).toBeDefined();
      expect(items.length).toBeGreaterThanOrEqual(2);

      const created = await orderService.createOrder(RESTAURANT_ID, {
        customer_id: customer!.id,
        type: OrderType.delivery,
        payment_method: PaymentMethod.cod,
        items: [
          { menu_item_id: items[0].id, qty: 2 },
          { menu_item_id: items[1].id, qty: 1 },
        ],
        address: "77 Clifton Road, Karachi",
        note: "Initial test bot order",
      });

      createdOrderIds.push(created.id);

      expect(created.id).toBeDefined();
      expect(created.restaurant_id).toBe(RESTAURANT_ID);
      expect(created.status).toBe(OrderStatus.PENDING);
      expect(created.payment_method).toBe(PaymentMethod.cod);
      expect(created.payment_status).toBe(PaymentStatus.pending);
      expect(typeof created.number).toBe("string");
      expect(Number(created.number)).toBeGreaterThanOrEqual(1001);

      // Verify subtotal, delivery fee and total
      const expectedSubtotal = items[0].price * 2 + items[1].price * 1;
      expect(created.subtotal).toBe(expectedSubtotal);
      expect(created.delivery_fee).toBe(15000); // 15000 minor units configured on demo hotel
      expect(created.total).toBe(expectedSubtotal + 15000);

      // Verify item snapshots
      expect(created.items.length).toBe(2);
      expect(created.items[0].price_snapshot).toBe(items[0].price);
      expect(created.items[0].qty).toBe(2);
      expect(typeof created.items[0].name_snapshot).toBe("string");

      // Verify initial event
      expect(created.events.length).toBe(1);
      expect(created.events[0].status).toBe(OrderStatus.PENDING);
      expect(created.events[0].note).toBe("Initial test bot order");
    });

    it("throws NOT_FOUND if a menu item does not exist", async () => {
      const customer = await prisma.customer.findFirst({
        where: { restaurant_id: RESTAURANT_ID },
      });

      await expect(
        orderService.createOrder(RESTAURANT_ID, {
          customer_id: customer!.id,
          type: OrderType.delivery,
          payment_method: PaymentMethod.cod,
          items: [{ menu_item_id: "00000000-0000-4000-8000-000000009999", qty: 1 }],
        })
      ).rejects.toThrow("Menu item not found");
    });
  });
});
