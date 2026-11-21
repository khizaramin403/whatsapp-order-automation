import type { OrderStatus, OrderType } from "./types";

/**
 * Returns the list of valid next order statuses based on the current status and order type.
 * References: PROJECT_PLAN_v1.1 Section 10.2
 *
 * Flow:
 * - Delivery: PENDING -> ACCEPTED -> PREPARING -> READY -> OUT_FOR_DELIVERY -> DELIVERED
 *   (PENDING can also go to REJECTED; active states can be CANCELLED)
 * - Dine-in & Pickup: PENDING -> ACCEPTED -> PREPARING -> READY -> COMPLETED
 *   (PENDING can also go to REJECTED; active states can be CANCELLED)
 */
export function nextStatuses(
  status: OrderStatus,
  orderType: OrderType = "delivery"
): OrderStatus[] {
  if (orderType === "dine_in" || orderType === "pickup") {
    switch (status) {
      case "PENDING":
        return ["ACCEPTED", "REJECTED", "CANCELLED"];
      case "ACCEPTED":
        return ["PREPARING", "CANCELLED"];
      case "PREPARING":
        return ["READY", "CANCELLED"];
      case "READY":
        return ["COMPLETED", "CANCELLED"];
      case "COMPLETED":
      case "REJECTED":
      case "CANCELLED":
      default:
        return [];
    }
  }

  // Delivery order type
  switch (status) {
    case "PENDING":
      return ["ACCEPTED", "REJECTED", "CANCELLED"];
    case "ACCEPTED":
      return ["PREPARING", "CANCELLED"];
    case "PREPARING":
      return ["READY", "CANCELLED"];
    case "READY":
      return ["OUT_FOR_DELIVERY", "CANCELLED"];
    case "OUT_FOR_DELIVERY":
      return ["DELIVERED", "CANCELLED"];
    case "DELIVERED":
    case "REJECTED":
    case "CANCELLED":
    default:
      return [];
  }
}

/**
 * Validates whether transitioning an order from `from` status to `to` status is allowed.
 */
export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  orderType: OrderType = "delivery"
): boolean {
  if (from === to) return false;
  const allowed = nextStatuses(from, orderType);
  return allowed.includes(to);
}
