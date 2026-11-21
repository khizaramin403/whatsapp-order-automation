import { fakeStore } from "./fake-store";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  MenuItem,
  MenuTranslation,
  Restaurant,
  User,
  AnalyticsSummary,
} from "@app/shared";
import type { GetOrdersParams, PaginatedResponse, MenuResponse } from "./types";

export * from "./types";
export * from "./seed-data";
export { fakeStore };

/**
 * Fetch orders with filters (status, date, payment) and pagination (page, pageSize).
 * Returns { data: Order[], meta: { page, pageSize, total } } matching Section 10.2
 */
export async function getOrders(params?: GetOrdersParams): Promise<PaginatedResponse<Order>> {
  return fakeStore.getOrders(params);
}

/**
 * Fetch a single order by ID with customer, items, timeline events, and payment proofs.
 */
export async function getOrder(id: string): Promise<Order> {
  return fakeStore.getOrder(id);
}

/**
 * Update an order's status enforcing transition rules from Section 10.2.
 */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return fakeStore.updateOrderStatus(id, status);
}

/**
 * Update payment status for an order (e.g. verified or not_received).
 */
export async function updatePaymentStatus(
  id: string,
  paymentStatus: PaymentStatus
): Promise<Order> {
  return fakeStore.updatePaymentStatus(id, paymentStatus);
}

/**
 * Fetch full menu (categories and items with translations in en, ar, ur-Latn).
 */
export async function getMenu(): Promise<MenuResponse> {
  return fakeStore.getMenu();
}

/**
 * Update a menu item's details and/or translations.
 */
export async function updateMenuItem(
  id: string,
  data: Partial<MenuItem> & { translations?: MenuTranslation[] }
): Promise<MenuItem> {
  return fakeStore.updateMenuItem(id, data);
}

/**
 * Toggle menu item availability on/off.
 */
export async function setItemAvailability(
  id: string,
  is_available: boolean
): Promise<MenuItem> {
  return fakeStore.setItemAvailability(id, is_available);
}

/**
 * Fetch analytics summary (sales, orders per hour, payment split, top items).
 */
export async function getAnalyticsSummary(
  range?: "today" | "7d" | "30d"
): Promise<AnalyticsSummary> {
  return fakeStore.getAnalyticsSummary(range);
}

/**
 * Fetch staff users for the restaurant team.
 */
export async function getTeam(): Promise<User[]> {
  return fakeStore.getTeam();
}

/**
 * Fetch current restaurant settings.
 */
export async function getSettings(): Promise<Restaurant> {
  return fakeStore.getSettings();
}

/**
 * Update restaurant settings.
 */
export async function updateSettings(data: Partial<Restaurant>): Promise<Restaurant> {
  return fakeStore.updateSettings(data);
}

/**
 * Live simulator helper: add a new pending order.
 */
export async function addPendingOrder(): Promise<Order> {
  return fakeStore.addPendingOrder();
}
