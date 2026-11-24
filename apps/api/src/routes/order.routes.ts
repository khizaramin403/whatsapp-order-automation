import { Router } from "express";
import { z } from "zod";
import { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from "@prisma/client";
import { orderController } from "../controllers/order.controller";
import { authenticate, tenant } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { dashboardLimiter } from "../middleware/rateLimiter";

export const dateStringSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" });

export const getOrdersQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  payment_method: z.nativeEnum(PaymentMethod).optional(),
  type: z.nativeEnum(OrderType).optional(),
  dateFrom: dateStringSchema.optional(),
  dateTo: dateStringSchema.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

export const orderIdParamSchema = z.object({
  id: z.string().uuid("Invalid order ID format"),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: "A valid order status is required" }),
  }),
  note: z.string().optional(),
});

export const updatePaymentSchema = z.object({
  payment_status: z.enum([PaymentStatus.verified, PaymentStatus.not_received], {
    errorMap: () => ({ message: "Payment status must be either 'verified' or 'not_received'" }),
  }),
});

export const orderRouter = Router();

// Apply authentication, tenant isolation, and dashboard rate limiter
orderRouter.use(authenticate, tenant, dashboardLimiter);

orderRouter.get("/", validate({ query: getOrdersQuerySchema }), orderController.getOrders);

orderRouter.get("/:id", validate({ params: orderIdParamSchema }), orderController.getOrderById);

orderRouter.patch(
  "/:id/status",
  validate({ params: orderIdParamSchema, body: updateStatusSchema }),
  orderController.updateStatus
);

orderRouter.patch(
  "/:id/payment",
  validate({ params: orderIdParamSchema, body: updatePaymentSchema }),
  orderController.updatePayment
);

export default orderRouter;
