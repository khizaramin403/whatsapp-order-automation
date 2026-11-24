import { prisma } from "../config/prisma";
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { AppError } from "../utils/errors";

export interface OrderQueryFilters {
  status?: OrderStatus;
  payment_method?: PaymentMethod;
  type?: OrderType;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface OrderItemSnapshotData {
  menu_item_id: string;
  name_snapshot: string;
  price_snapshot: number;
  qty: number;
}

export interface CreateOrderRepoInput {
  customer_id: string;
  number: string;
  type: OrderType;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  address?: string | null;
  scheduled_for?: Date | null;
  items: OrderItemSnapshotData[];
  note?: string | null;
}

const orderIncludes = {
  customer: {
    select: {
      id: true,
      name: true,
      phone: true,
      language: true,
      last_address: true,
    },
  },
  items: {
    select: {
      id: true,
      menu_item_id: true,
      name_snapshot: true,
      price_snapshot: true,
      qty: true,
    },
  },
  events: {
    orderBy: { created_at: "asc" as const },
    select: {
      id: true,
      status: true,
      by_user_id: true,
      note: true,
      created_at: true,
      by_user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  },
  payment_proofs: {
    select: {
      id: true,
      storage_key: true,
      created_at: true,
    },
  },
} satisfies Prisma.OrderInclude;

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof orderIncludes;
}>;

export class OrderRepository {
  /**
   * Enforces restaurant_id isolation. Throws if restaurantId is missing.
   */
  private assertRestaurantId(restaurantId: string): void {
    if (!restaurantId || typeof restaurantId !== "string" || restaurantId.trim() === "") {
      throw AppError.forbidden("Tenant restaurant ID is required for order repository operations");
    }
  }

  async findMany(
    restaurantId: string,
    filters: OrderQueryFilters,
    pagination: { skip: number; take: number }
  ): Promise<[OrderWithRelations[], number]> {
    this.assertRestaurantId(restaurantId);

    const where: Prisma.OrderWhereInput = {
      restaurant_id: restaurantId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.payment_method) {
      where.payment_method = filters.payment_method;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.created_at = {};
      if (filters.dateFrom) {
        where.created_at.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.created_at.lte = filters.dateTo;
      }
    }

    if (filters.search) {
      const term = filters.search.trim();
      where.OR = [
        { number: { contains: term, mode: "insensitive" } },
        { customer: { name: { contains: term, mode: "insensitive" } } },
        { customer: { phone: { contains: term, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderIncludes,
        orderBy: { created_at: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.order.count({ where }),
    ]);

    return [orders, total];
  }

  async findById(restaurantId: string, orderId: string): Promise<OrderWithRelations | null> {
    this.assertRestaurantId(restaurantId);

    return prisma.order.findFirst({
      where: {
        id: orderId,
        restaurant_id: restaurantId,
      },
      include: orderIncludes,
    });
  }

  async updateStatus(
    restaurantId: string,
    orderId: string,
    status: OrderStatus,
    eventData: { byUserId: string | null; note?: string }
  ): Promise<OrderWithRelations> {
    this.assertRestaurantId(restaurantId);

    return prisma.$transaction(async (tx) => {
      // Confirm order belongs to tenant restaurant
      const existing = await tx.order.findFirst({
        where: { id: orderId, restaurant_id: restaurantId },
      });

      if (!existing) {
        throw AppError.notFound("Order not found");
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status },
        include: orderIncludes,
      });

      await tx.orderEvent.create({
        data: {
          restaurant_id: restaurantId,
          order_id: orderId,
          status,
          by_user_id: eventData.byUserId,
          note: eventData.note || null,
        },
      });

      return updated;
    });
  }

  async updatePaymentStatus(
    restaurantId: string,
    orderId: string,
    paymentStatus: PaymentStatus,
    eventData: { byUserId: string | null; note?: string }
  ): Promise<OrderWithRelations> {
    this.assertRestaurantId(restaurantId);

    return prisma.$transaction(async (tx) => {
      const existing = await tx.order.findFirst({
        where: { id: orderId, restaurant_id: restaurantId },
      });

      if (!existing) {
        throw AppError.notFound("Order not found");
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: { payment_status: paymentStatus },
        include: orderIncludes,
      });

      await tx.orderEvent.create({
        data: {
          restaurant_id: restaurantId,
          order_id: orderId,
          status: existing.status,
          by_user_id: eventData.byUserId,
          note: eventData.note || `Payment marked as ${paymentStatus}`,
        },
      });

      return updated;
    });
  }

  /**
   * Generates next unique per-hotel order number safely inside a transaction
   */
  async getNextOrderNumber(restaurantId: string, tx: Prisma.TransactionClient): Promise<string> {
    this.assertRestaurantId(restaurantId);

    const result = await tx.$queryRaw<{ max_num: number | null }[]>`
      SELECT MAX(CASE WHEN number ~ '^[0-9]+$' THEN CAST(number AS INTEGER) ELSE 0 END) as max_num 
      FROM orders 
      WHERE restaurant_id = ${restaurantId}
    `;

    const maxNum = result[0]?.max_num;
    let nextNum = 1001;
    if (maxNum && !isNaN(Number(maxNum)) && Number(maxNum) >= 1000) {
      nextNum = Number(maxNum) + 1;
    }

    return String(nextNum);
  }

  /**
   * Creates an order with items and initial event inside a single atomic transaction
   */
  async createOrder(restaurantId: string, input: CreateOrderRepoInput): Promise<OrderWithRelations> {
    this.assertRestaurantId(restaurantId);

    return prisma.$transaction(async (tx) => {
      const orderNumber = input.number || (await this.getNextOrderNumber(restaurantId, tx));

      const createdOrder = await tx.order.create({
        data: {
          restaurant_id: restaurantId,
          customer_id: input.customer_id,
          number: orderNumber,
          type: input.type,
          status: input.status,
          payment_method: input.payment_method,
          payment_status: input.payment_status,
          subtotal: input.subtotal,
          delivery_fee: input.delivery_fee,
          total: input.total,
          address: input.address || null,
          scheduled_for: input.scheduled_for || null,
          items: {
            create: input.items.map((item) => ({
              restaurant_id: restaurantId,
              menu_item_id: item.menu_item_id,
              name_snapshot: item.name_snapshot,
              price_snapshot: item.price_snapshot,
              qty: item.qty,
            })),
          },
        },
      });

      // Write initial order creation timeline event
      await tx.orderEvent.create({
        data: {
          restaurant_id: restaurantId,
          order_id: createdOrder.id,
          status: input.status,
          by_user_id: null,
          note: input.note || "Order placed via bot",
        },
      });

      // Return fully populated order
      const fullOrder = await tx.order.findUniqueOrThrow({
        where: { id: createdOrder.id },
        include: orderIncludes,
      });

      return fullOrder;
    });
  }
}

export const orderRepository = new OrderRepository();
