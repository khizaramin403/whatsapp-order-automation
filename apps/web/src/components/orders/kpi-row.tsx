"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@app/shared";
import type { Order } from "@app/shared";

interface KpiRowProps {
  orders?: Order[];
  isLoading?: boolean;
}

export function KpiRow({ orders = [], isLoading = false }: KpiRowProps) {
  const t = useTranslations("orders.kpis");

  // KPI Calculations
  const metrics = React.useMemo(() => {
    let newCount = 0;
    let kitchenCount = 0;
    let deliveryCount = 0;
    let salesTotal = 0;

    for (const o of orders) {
      if (o.status === "PENDING") {
        newCount += 1;
      } else if (o.status === "ACCEPTED" || o.status === "PREPARING") {
        kitchenCount += 1;
      } else if (o.status === "OUT_FOR_DELIVERY") {
        deliveryCount += 1;
      }

      // Delivered or completed orders contribute to total sales
      if (o.status === "DELIVERED" || o.status === "COMPLETED") {
        salesTotal += o.total;
      }
    }

    return {
      newCount,
      kitchenCount,
      deliveryCount,
      salesTotal,
    };
  }, [orders]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. New Orders */}
      <Card className="p-5">
        <p className="text-caption text-[#5F6C79] mb-1">{t("newOrders")}</p>
        <p className="text-kpi font-semibold text-[#10202D] tabular-nums">
          {metrics.newCount}
        </p>
      </Card>

      {/* 2. In Kitchen */}
      <Card className="p-5">
        <p className="text-caption text-[#5F6C79] mb-1">{t("inKitchen")}</p>
        <p className="text-kpi font-semibold text-[#10202D] tabular-nums">
          {metrics.kitchenCount}
        </p>
      </Card>

      {/* 3. Out for Delivery */}
      <Card className="p-5">
        <p className="text-caption text-[#5F6C79] mb-1">{t("outForDelivery")}</p>
        <p className="text-kpi font-semibold text-[#10202D] tabular-nums">
          {metrics.deliveryCount}
        </p>
      </Card>

      {/* 4. Today's Sales */}
      <Card className="p-5">
        <p className="text-caption text-[#5F6C79] mb-1">{t("todaySales")}</p>
        <p className="text-kpi font-semibold text-[#10202D] tabular-nums">
          {formatMoney(metrics.salesTotal, "PKR")}
        </p>
      </Card>
    </div>
  );
}
