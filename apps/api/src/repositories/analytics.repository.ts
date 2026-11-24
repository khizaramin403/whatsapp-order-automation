import { prisma } from "../config/prisma";
import { PaymentMethod } from "@prisma/client";
import { AppError } from "../utils/errors";

export interface AnalyticsSummaryResult {
  range: "today" | "7d" | "30d";
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
  codShare: number;
  ordersPerHour: Array<{ hour: string; count: number; isPeak?: boolean }>;
  salesOverTime: Array<{ date: string; sales: number }>;
  paymentSplit: Array<{ method: PaymentMethod; count: number; percentage: number }>;
  topItems: Array<{ id: string; name: string; quantity: number; revenue: number }>;
}

export class AnalyticsRepository {
  private assertRestaurantId(restaurantId: string): void {
    if (!restaurantId || typeof restaurantId !== "string" || restaurantId.trim() === "") {
      throw AppError.forbidden("Tenant restaurant ID is required for analytics operations");
    }
  }

  async getSummary(
    restaurantId: string,
    range: "today" | "7d" | "30d",
    dateFrom: Date,
    dateTo: Date
  ): Promise<AnalyticsSummaryResult> {
    this.assertRestaurantId(restaurantId);

    // 1. Overall sales & order counts (excluding CANCELLED and REJECTED)
    const salesAgg = await prisma.$queryRaw<
      Array<{ order_count: number; total_sales: string | number | bigint }>
    >`
      SELECT
        COUNT(*)::int as order_count,
        COALESCE(SUM(total), 0) as total_sales
      FROM orders
      WHERE restaurant_id = ${restaurantId}
        AND created_at >= ${dateFrom}
        AND created_at <= ${dateTo}
        AND status NOT IN ('CANCELLED', 'REJECTED')
    `;

    const orderCount = salesAgg[0]?.order_count ? Number(salesAgg[0].order_count) : 0;
    const totalSales = salesAgg[0]?.total_sales ? Number(salesAgg[0].total_sales) : 0;
    const averageOrderValue = orderCount > 0 ? Math.round(totalSales / orderCount) : 0;

    // 2. COD share
    const codAgg = await prisma.$queryRaw<
      Array<{ cod_count: number; total_count: number }>
    >`
      SELECT
        COUNT(CASE WHEN payment_method = 'cod' THEN 1 END)::int as cod_count,
        COUNT(*)::int as total_count
      FROM orders
      WHERE restaurant_id = ${restaurantId}
        AND created_at >= ${dateFrom}
        AND created_at <= ${dateTo}
    `;

    const totalOrdersAll = codAgg[0]?.total_count ? Number(codAgg[0].total_count) : 0;
    const codOrders = codAgg[0]?.cod_count ? Number(codAgg[0].cod_count) : 0;
    const codShare =
      totalOrdersAll > 0 ? Math.round((codOrders / totalOrdersAll) * 100) / 100 : 0;

    // 3. Orders per hour (grouped by hotel timezone)
    const ordersPerHourRaw = await prisma.$queryRaw<
      Array<{ hour: string; count: number }>
    >`
      SELECT
        TO_CHAR(o.created_at AT TIME ZONE r.timezone, 'HH24:00') as hour,
        COUNT(*)::int as count
      FROM orders o
      JOIN restaurants r ON r.id = o.restaurant_id
      WHERE o.restaurant_id = ${restaurantId}
        AND o.created_at >= ${dateFrom}
        AND o.created_at <= ${dateTo}
      GROUP BY hour
      ORDER BY hour ASC
    `;

    let maxHourlyCount = 0;
    for (const h of ordersPerHourRaw) {
      const c = Number(h.count);
      if (c > maxHourlyCount) maxHourlyCount = c;
    }

    const ordersPerHour = ordersPerHourRaw.map((h) => ({
      hour: h.hour,
      count: Number(h.count),
      isPeak: maxHourlyCount > 0 && Number(h.count) === maxHourlyCount,
    }));

    // 4. Sales over time (by date in hotel timezone)
    const salesOverTimeRaw = await prisma.$queryRaw<
      Array<{ date: string; sales: string | number | bigint }>
    >`
      SELECT
        TO_CHAR(o.created_at AT TIME ZONE r.timezone, 'YYYY-MM-DD') as date,
        COALESCE(SUM(o.total), 0) as sales
      FROM orders o
      JOIN restaurants r ON r.id = o.restaurant_id
      WHERE o.restaurant_id = ${restaurantId}
        AND o.created_at >= ${dateFrom}
        AND o.created_at <= ${dateTo}
        AND o.status NOT IN ('CANCELLED', 'REJECTED')
      GROUP BY date
      ORDER BY date ASC
    `;

    const salesOverTime = salesOverTimeRaw.map((s) => ({
      date: s.date,
      sales: Number(s.sales),
    }));

    // 5. Payment method split
    const paymentSplitRaw = await prisma.$queryRaw<
      Array<{ method: PaymentMethod; count: number }>
    >`
      SELECT
        payment_method as method,
        COUNT(*)::int as count
      FROM orders
      WHERE restaurant_id = ${restaurantId}
        AND created_at >= ${dateFrom}
        AND created_at <= ${dateTo}
      GROUP BY payment_method
    `;

    const paymentSplit = paymentSplitRaw.map((p) => {
      const cnt = Number(p.count);
      const percentage =
        totalOrdersAll > 0 ? Math.round((cnt / totalOrdersAll) * 100) : 0;
      return {
        method: p.method,
        count: cnt,
        percentage,
      };
    });

    // 6. Top selling items
    const topItemsRaw = await prisma.$queryRaw<
      Array<{ id: string; name: string; quantity: number; revenue: string | number | bigint }>
    >`
      SELECT
        oi.menu_item_id as id,
        oi.name_snapshot as name,
        SUM(oi.qty)::int as quantity,
        COALESCE(SUM(oi.price_snapshot * oi.qty), 0) as revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.restaurant_id = ${restaurantId}
        AND o.created_at >= ${dateFrom}
        AND o.created_at <= ${dateTo}
        AND o.status NOT IN ('CANCELLED', 'REJECTED')
      GROUP BY oi.menu_item_id, oi.name_snapshot
      ORDER BY quantity DESC
      LIMIT 5
    `;

    const topItems = topItemsRaw.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: Number(item.quantity),
      revenue: Number(item.revenue),
    }));

    return {
      range,
      totalSales,
      orderCount,
      averageOrderValue,
      codShare,
      ordersPerHour,
      salesOverTime,
      paymentSplit,
      topItems,
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
