"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { DollarSign, ShoppingBag, TrendingUp, Banknote } from "lucide-react";
import type { AnalyticsSummary } from "@app/shared";
import { formatMoney } from "@app/shared";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsKpiRowProps {
  data?: AnalyticsSummary;
  currency?: string;
  isLoading?: boolean;
}

export function AnalyticsKpiRow({
  data,
  currency = "PKR",
  isLoading = false,
}: AnalyticsKpiRowProps) {
  const t = useTranslations("analytics");
  const locale = useLocale();
  const formatLocale = locale === "ar" ? "ar-PK" : "en-PK";

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5 bg-white border-[#E2E5E9] rounded-[12px] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-28" />
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      id: "sales",
      title: t("kpis.totalSales"),
      value: formatMoney(data.totalSales, currency, formatLocale),
      subtitle: data.range === "today" ? t("kpis.todaySubtitle") : t("kpis.periodSubtitle"),
      icon: DollarSign,
      iconBg: "bg-[#F4ECDC]",
      iconColor: "text-[#7D6228]",
    },
    {
      id: "orders",
      title: t("kpis.orders"),
      value: data.orderCount.toLocaleString(),
      subtitle: data.range === "today" ? t("kpis.todaySubtitle") : t("kpis.periodSubtitle"),
      icon: ShoppingBag,
      iconBg: "bg-[#ECEEF1]",
      iconColor: "text-[#10202D]",
    },
    {
      id: "aov",
      title: t("kpis.averageOrderValue"),
      value: formatMoney(data.averageOrderValue, currency, formatLocale),
      subtitle: t("kpis.periodSubtitle"),
      icon: TrendingUp,
      iconBg: "bg-[#E3EDF5]",
      iconColor: "text-[#1F4C73]",
    },
    {
      id: "cod",
      title: t("kpis.codShare"),
      value: `${Math.round(data.codShare * 100)}%`,
      subtitle: `${100 - Math.round(data.codShare * 100)}% ${t("charts.online")}`,
      icon: Banknote,
      iconBg: "bg-[#E6F2EC]",
      iconColor: "text-[#1F5C42]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.id}
            className="p-5 bg-white border-[#E2E5E9] rounded-[12px] shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-[#5F6C79] uppercase tracking-wider">
                {kpi.title}
              </span>
              <div
                className={`h-8 w-8 rounded-full ${kpi.iconBg} ${kpi.iconColor} flex items-center justify-center`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-semibold text-[#10202D] tabular-nums tracking-tight">
                {kpi.value}
              </div>
              <p className="text-[11px] text-[#5F6C79] mt-1">{kpi.subtitle}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
