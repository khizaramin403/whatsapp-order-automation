import { Request, Response, NextFunction } from "express";
import { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from "@prisma/client";
import { OrderService, orderService } from "../services/order.service";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/errors";

export class OrderController {
  constructor(private readonly service: OrderService = orderService) {}

  getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw AppError.unauthenticated("Authentication required");
      }

      const { status, payment_method, type, dateFrom, dateTo, search, page, pageSize } = req.query;

      const filters = {
        status: status as OrderStatus | undefined,
        payment_method: payment_method as PaymentMethod | undefined,
        type: type as OrderType | undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        search: typeof search === "string" ? search : undefined,
      };

      const result = await this.service.getOrders(req.user, filters, { page, pageSize });
      sendSuccess(res, result.orders, result.meta);
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw AppError.unauthenticated("Authentication required");
      }

      const order = await this.service.getOrderById(req.user, req.params.id);
      sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw AppError.unauthenticated("Authentication required");
      }

      const { status, note } = req.body;
      const order = await this.service.changeStatus(req.user, req.params.id, status, note);
      sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  };

  updatePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw AppError.unauthenticated("Authentication required");
      }

      const { payment_status } = req.body;
      const order = await this.service.updatePayment(
        req.user,
        req.params.id,
        payment_status as PaymentStatus
      );
      sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  };
}

export const orderController = new OrderController();
