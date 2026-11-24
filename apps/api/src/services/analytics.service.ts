import { Role } from "@prisma/client";
import {
  analyticsRepository,
  AnalyticsRepository,
  AnalyticsSummaryResult,
} from "../repositories/analytics.repository";
import { AppError } from "../utils/errors";
import { AccessTokenPayload } from "./auth.service";

export class AnalyticsService {
  constructor(private readonly analyticsRepo: AnalyticsRepository = analyticsRepository) {}

  private getEffectiveRestaurantId(user: AccessTokenPayload): string {
    if (!user.restaurantId) {
      throw AppError.forbidden("No restaurant associated with this user account");
    }
    return user.restaurantId;
  }

  private assertOwner(user: AccessTokenPayload): void {
    if (user.role !== Role.owner && user.role !== Role.super_admin) {
      throw AppError.forbidden("Only the hotel owner can view analytics");
    }
  }

  async getSummary(
    user: AccessTokenPayload,
    range: "today" | "7d" | "30d" = "today",
    customFrom?: Date,
    customTo?: Date
  ): Promise<AnalyticsSummaryResult> {
    this.assertOwner(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const now = new Date();
    let dateFrom: Date;
    const dateTo: Date = customTo || now;

    if (customFrom) {
      dateFrom = customFrom;
    } else if (range === "7d") {
      dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30d") {
      dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      // today: midnight in current UTC day or 24 hours ago
      dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    }

    return this.analyticsRepo.getSummary(restaurantId, range, dateFrom, dateTo);
  }
}

export const analyticsService = new AnalyticsService();
