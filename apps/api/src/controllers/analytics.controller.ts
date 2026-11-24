import { Request, Response, NextFunction } from "express";
import { analyticsService, AnalyticsService } from "../services/analytics.service";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/errors";

export class AnalyticsController {
  constructor(private readonly service: AnalyticsService = analyticsService) {}

  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const { range, dateFrom, dateTo } = req.query;

      const parsedRange =
        range === "7d" || range === "30d" || range === "today" ? range : "today";

      const parsedFrom = typeof dateFrom === "string" ? new Date(dateFrom) : undefined;
      const parsedTo = typeof dateTo === "string" ? new Date(dateTo) : undefined;

      const summary = await this.service.getSummary(
        req.user,
        parsedRange,
        parsedFrom,
        parsedTo
      );

      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  };
}

export const analyticsController = new AnalyticsController();
