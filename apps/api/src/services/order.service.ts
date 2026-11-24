import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  Role,
} from "@prisma/client";
import {
  canTransition,
  OrderStatus as SharedOrderStatus,
  OrderType as SharedOrderType,
} from "@app/shared";
import { prisma } from "../config/prisma";
import {
  orderRepository,
  OrderRepository,
  OrderQueryFilters,
  OrderWithRelations,
} from "../repositories/order.repository";
import { AppError } from "../utils/errors";
import { AccessTokenPayload } from "./auth.service";
import { parsePagination, buildPaginationMeta, PaginationMeta } from "../utils/pagination";

export interface CreateOrderItemInput {
  menu_item_id: string;
  qty: number;
}

export interface CreateOrderInput {
  customer_id: string;
  type: OrderType;
  payment_method: PaymentMethod;
  items: CreateOrderItemInput[];
  address?: string | null;
  scheduled_for?: Date | null;
  note?: string | null;
}

export class OrderService {
  constructor(private readonly orderRepo: OrderRepository = orderRepository) {}

  private getEffectiveRestaurantId(user: AccessTokenPayload): string {
    if (!user.restaurantId) {
      throw AppError.forbidden("No restaurant associated with this account");
    }
    return user.restaurantId;
  }

  /**
   * Data protection and role-based response shaping:
   * - Chef: receives ONLY order number, status, type, items and quantities, notes and times.
   *   NO customer phone, NO address, NO payment info or financial totals.
   * - Rider: receives address, customer name and phone, and cash amount only for COD orders.
   *   NO payment proof.
   * - Owner & Manager: full access.
   */
  shapeOrderForRole(order: OrderWithRelations, role: Role): unknown {
    if (role === Role.chef) {
      return {
        id: order.id,
        restaurant_id: order.restaurant_id,
        number: order.number,
        type: order.type,
        status: order.status,
        scheduled_for: order.scheduled_for,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: order.items.map((i) => ({
          id: i.id,
          menu_item_id: i.menu_item_id,
          name_snapshot: i.name_snapshot,
          qty: i.qty,
        })),
        events: order.events.map((e) => ({
          id: e.id,
          status: e.status,
          note: e.note,
          created_at: e.created_at,
        })),
      };
    }

    if (role === Role.rider) {
      const isCod = order.payment_method === PaymentMethod.cod;
      return {
        id: order.id,
        restaurant_id: order.restaurant_id,
        number: order.number,
        type: order.type,
        status: order.status,
        address: order.address,
        scheduled_for: order.scheduled_for,
        created_at: order.created_at,
        updated_at: order.updated_at,
        payment_method: order.payment_method,
        cash_to_collect: isCod ? order.total : 0,
        customer: order.customer
          ? {
              name: order.customer.name,
              phone: order.customer.phone,
              last_address: order.customer.last_address,
            }
          : null,
        items: order.items.map((i) => ({
          id: i.id,
          name_snapshot: i.name_snapshot,
          qty: i.qty,
        })),
        events: order.events,
      };
    }

    // Owner, Manager, Super Admin: full access
    return order;
  }

  async getOrders(
    user: AccessTokenPayload,
    filters: OrderQueryFilters,
    queryPagination: Record<string, unknown>
  ): Promise<{ orders: unknown[]; meta: PaginationMeta }> {
    const restaurantId = this.getEffectiveRestaurantId(user);
    const { page, pageSize, skip, take } = parsePagination(queryPagination);

    const [orders, total] = await this.orderRepo.findMany(restaurantId, filters, { skip, take });
    const shapedOrders = orders.map((o) => this.shapeOrderForRole(o, user.role));
    const meta = buildPaginationMeta(page, pageSize, total);

    return { orders: shapedOrders, meta };
  }

  async getOrderById(user: AccessTokenPayload, orderId: string): Promise<unknown> {
    const restaurantId = this.getEffectiveRestaurantId(user);
    const order = await this.orderRepo.findById(restaurantId, orderId);

    if (!order) {
      throw AppError.notFound("Order not found");
    }

    return this.shapeOrderForRole(order, user.role);
  }

  async changeStatus(
    user: AccessTokenPayload,
    orderId: string,
    newStatus: OrderStatus,
    note?: string
  ): Promise<unknown> {
    const restaurantId = this.getEffectiveRestaurantId(user);
    const order = await this.orderRepo.findById(restaurantId, orderId);

    if (!order) {
      throw AppError.notFound("Order not found");
    }

    // 1. Transition rules check from @app/shared
    const allowed = canTransition(
      order.status as SharedOrderStatus,
      newStatus as SharedOrderStatus,
      order.type as SharedOrderType
    );
    if (!allowed) {
      throw AppError.invalidOrderTransition(
        `Cannot move ${order.status} to ${newStatus}`
      );
    }

    // 2. Role constraints check:
    // - Owner and Manager can execute any valid transition.
    // - Chef can ONLY move ACCEPTED -> PREPARING and PREPARING -> READY.
    // - Rider can ONLY move READY -> OUT_FOR_DELIVERY and OUT_FOR_DELIVERY -> DELIVERED, and ONLY for delivery orders.
    if (user.role === Role.chef) {
      const isChefAllowed =
        (order.status === OrderStatus.ACCEPTED && newStatus === OrderStatus.PREPARING) ||
        (order.status === OrderStatus.PREPARING && newStatus === OrderStatus.READY);

      if (!isChefAllowed) {
        throw AppError.forbidden(
          "Chef can only move orders from ACCEPTED to PREPARING or from PREPARING to READY"
        );
      }
    } else if (user.role === Role.rider) {
      if (order.type !== OrderType.delivery) {
        throw AppError.forbidden("Riders can only manage delivery orders");
      }

      const isRiderAllowed =
        (order.status === OrderStatus.READY && newStatus === OrderStatus.OUT_FOR_DELIVERY) ||
        (order.status === OrderStatus.OUT_FOR_DELIVERY && newStatus === OrderStatus.DELIVERED);

      if (!isRiderAllowed) {
        throw AppError.forbidden(
          "Rider can only move orders from READY to OUT_FOR_DELIVERY or from OUT_FOR_DELIVERY to DELIVERED"
        );
      }
    } else if (
      user.role !== Role.owner &&
      user.role !== Role.manager &&
      user.role !== Role.super_admin
    ) {
      throw AppError.forbidden("Insufficient permissions to transition order status");
    }

    const updated = await this.orderRepo.updateStatus(restaurantId, orderId, newStatus, {
      byUserId: user.userId,
      note,
    });

    return this.shapeOrderForRole(updated, user.role);
  }

  async updatePayment(
    user: AccessTokenPayload,
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<unknown> {
    const restaurantId = this.getEffectiveRestaurantId(user);

    // Only Owner and Manager are allowed to verify or reject payments
    if (
      user.role !== Role.owner &&
      user.role !== Role.manager &&
      user.role !== Role.super_admin
    ) {
      throw AppError.forbidden("Only owner and manager can update payment status");
    }

    if (paymentStatus !== PaymentStatus.verified && paymentStatus !== PaymentStatus.not_received) {
      throw AppError.badRequest("Payment status can only be updated to verified or not_received");
    }

    const order = await this.orderRepo.findById(restaurantId, orderId);
    if (!order) {
      throw AppError.notFound("Order not found");
    }

    const updated = await this.orderRepo.updatePaymentStatus(restaurantId, orderId, paymentStatus, {
      byUserId: user.userId,
      note: `Payment marked as ${paymentStatus}`,
    });

    return this.shapeOrderForRole(updated, user.role);
  }

  /**
   * Internal service function createOrder (for WhatsApp bot in Phase 4).
   * Atomically snapshots item names, item prices, computes totals, assigns next sequence number,
   * and creates order, order items and first timeline event inside a single transaction.
   */
  async createOrder(restaurantId: string, input: CreateOrderInput): Promise<OrderWithRelations> {
    if (!restaurantId) {
      throw AppError.badRequest("restaurantId is required to create an order");
    }

    if (!input.items || input.items.length === 0) {
      throw AppError.badRequest("Order must contain at least one item");
    }

    // Verify restaurant exists and read delivery fee
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw AppError.notFound("Restaurant not found");
    }

    // Verify customer exists and belongs to restaurant
    const customer = await prisma.customer.findFirst({
      where: { id: input.customer_id, restaurant_id: restaurantId },
    });
    if (!customer) {
      throw AppError.notFound("Customer not found for this restaurant");
    }

    // Lookup menu items and take snapshots
    let subtotal = 0;
    const itemSnapshots = [];

    for (const itemInput of input.items) {
      const menuItem = await prisma.menuItem.findFirst({
        where: { id: itemInput.menu_item_id, restaurant_id: restaurantId },
      });

      if (!menuItem) {
        throw AppError.notFound(`Menu item not found: ${itemInput.menu_item_id}`);
      }

      if (!menuItem.is_available) {
        throw AppError.badRequest(`Menu item is currently unavailable: ${menuItem.id}`);
      }

      const translation = await prisma.menuTranslation.findFirst({
        where: {
          restaurant_id: restaurantId,
          entity_type: "item",
          entity_id: menuItem.id,
          language: restaurant.default_language,
        },
      });

      const resolvedName = translation?.name || "Item";
      const itemPrice = menuItem.price;
      subtotal += itemPrice * itemInput.qty;

      itemSnapshots.push({
        menu_item_id: menuItem.id,
        name_snapshot: resolvedName,
        price_snapshot: itemPrice,
        qty: itemInput.qty,
      });
    }

    const deliveryFee = input.type === OrderType.delivery ? restaurant.delivery_fee : 0;
    const total = subtotal + deliveryFee;

    // Default payment status based on payment method
    const initialPaymentStatus =
      input.payment_method === PaymentMethod.online
        ? PaymentStatus.pending_check
        : PaymentStatus.pending;

    return this.orderRepo.createOrder(restaurantId, {
      customer_id: customer.id,
      number: "", // repo will compute atomic next sequence number
      type: input.type,
      status: OrderStatus.PENDING,
      payment_method: input.payment_method,
      payment_status: initialPaymentStatus,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      address: input.type === OrderType.delivery ? input.address || customer.last_address : null,
      scheduled_for: input.scheduled_for || null,
      items: itemSnapshots,
      note: input.note || "Order placed via bot",
    });
  }
}

export const orderService = new OrderService();
