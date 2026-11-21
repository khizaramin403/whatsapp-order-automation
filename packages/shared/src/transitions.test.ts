import { describe, it, expect } from "vitest";
import { canTransition, nextStatuses } from "./transitions";
import type { OrderStatus, OrderType } from "./types";

describe("Order status transitions (PROJECT_PLAN_v1.1 Section 10.2)", () => {
  describe("Delivery flow", () => {
    const type: OrderType = "delivery";

    it("PENDING can transition to ACCEPTED, REJECTED, and CANCELLED", () => {
      expect(nextStatuses("PENDING", type)).toEqual(["ACCEPTED", "REJECTED", "CANCELLED"]);
      expect(canTransition("PENDING", "ACCEPTED", type)).toBe(true);
      expect(canTransition("PENDING", "REJECTED", type)).toBe(true);
      expect(canTransition("PENDING", "CANCELLED", type)).toBe(true);
      expect(canTransition("PENDING", "PREPARING", type)).toBe(false);
      expect(canTransition("PENDING", "DELIVERED", type)).toBe(false);
    });

    it("ACCEPTED can transition to PREPARING and CANCELLED", () => {
      expect(nextStatuses("ACCEPTED", type)).toEqual(["PREPARING", "CANCELLED"]);
      expect(canTransition("ACCEPTED", "PREPARING", type)).toBe(true);
      expect(canTransition("ACCEPTED", "CANCELLED", type)).toBe(true);
      expect(canTransition("ACCEPTED", "READY", type)).toBe(false);
      expect(canTransition("ACCEPTED", "REJECTED", type)).toBe(false);
    });

    it("PREPARING can transition to READY and CANCELLED", () => {
      expect(nextStatuses("PREPARING", type)).toEqual(["READY", "CANCELLED"]);
      expect(canTransition("PREPARING", "READY", type)).toBe(true);
      expect(canTransition("PREPARING", "CANCELLED", type)).toBe(true);
      expect(canTransition("PREPARING", "OUT_FOR_DELIVERY", type)).toBe(false);
    });

    it("READY can transition to OUT_FOR_DELIVERY and CANCELLED", () => {
      expect(nextStatuses("READY", type)).toEqual(["OUT_FOR_DELIVERY", "CANCELLED"]);
      expect(canTransition("READY", "OUT_FOR_DELIVERY", type)).toBe(true);
      expect(canTransition("READY", "CANCELLED", type)).toBe(true);
      expect(canTransition("READY", "DELIVERED", type)).toBe(false);
    });

    it("OUT_FOR_DELIVERY can transition to DELIVERED and CANCELLED", () => {
      expect(nextStatuses("OUT_FOR_DELIVERY", type)).toEqual(["DELIVERED", "CANCELLED"]);
      expect(canTransition("OUT_FOR_DELIVERY", "DELIVERED", type)).toBe(true);
      expect(canTransition("OUT_FOR_DELIVERY", "CANCELLED", type)).toBe(true);
      expect(canTransition("OUT_FOR_DELIVERY", "PREPARING", type)).toBe(false);
    });

    it("DELIVERED is terminal and cannot move to any state (e.g. PREPARING)", () => {
      expect(nextStatuses("DELIVERED", type)).toEqual([]);
      expect(canTransition("DELIVERED", "PREPARING", type)).toBe(false);
      expect(canTransition("DELIVERED", "ACCEPTED", type)).toBe(false);
      expect(canTransition("DELIVERED", "READY", type)).toBe(false);
      expect(canTransition("DELIVERED", "CANCELLED", type)).toBe(false);
    });

    it("REJECTED and CANCELLED are terminal states", () => {
      expect(nextStatuses("REJECTED", type)).toEqual([]);
      expect(canTransition("REJECTED", "ACCEPTED", type)).toBe(false);
      expect(nextStatuses("CANCELLED", type)).toEqual([]);
      expect(canTransition("CANCELLED", "ACCEPTED", type)).toBe(false);
    });

    it("Same status transition is rejected", () => {
      const statuses: OrderStatus[] = [
        "PENDING",
        "ACCEPTED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
      ];
      for (const s of statuses) {
        expect(canTransition(s, s, type)).toBe(false);
      }
    });
  });

  describe("Dine-in and Pickup flow", () => {
    it("Dine-in completes at READY -> COMPLETED instead of delivery steps", () => {
      const type: OrderType = "dine_in";
      expect(canTransition("READY", "COMPLETED", type)).toBe(true);
      expect(canTransition("READY", "OUT_FOR_DELIVERY", type)).toBe(false);
      expect(canTransition("READY", "DELIVERED", type)).toBe(false);
      expect(nextStatuses("COMPLETED", type)).toEqual([]);
    });

    it("Pickup completes at READY -> COMPLETED instead of delivery steps", () => {
      const type: OrderType = "pickup";
      expect(canTransition("READY", "COMPLETED", type)).toBe(true);
      expect(canTransition("READY", "OUT_FOR_DELIVERY", type)).toBe(false);
      expect(canTransition("READY", "DELIVERED", type)).toBe(false);
      expect(nextStatuses("COMPLETED", type)).toEqual([]);
    });
  });
});
