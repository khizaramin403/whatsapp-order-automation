"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Calendar, RefreshCw, AlertTriangle, BarChart3 } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { useSettings } from "@/hooks/use-settings";
import { AnalyticsKpiRow } from "./analytics-kpi-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Dynamic imports with Skeleton fallback per PERFORMANCE.md & Requirement 4
const OrdersPerHourChart = dynamic(
  () => import("./orders-per-hour-chart").then((mod) => mod.OrdersPerHourChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[340px] w-full rounded-[12px] bg-white border border-[#E2E5E9]" />,
  }
);

const SalesOverTimeChart = dynamic(
  () => import("./sales-over-time-chart").then((mod) => mod.SalesOverTimeChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[340px] w-full rounded-[12px] bg-white border border-[#E2E5E9]" />,
  }
);

const PaymentDonutChart = dynamic(
  () => import("./payment-donut-chart").then((mod) => mod.PaymentDonutChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[340px] w-full rounded-[12px] bg-white border border-[#E2E5E9]" />,
  }
);

const TopItemsCard = dynamic(
  () => import("./top-items-card").then((mod) => mod.TopItemsCard),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[340px] w-full rounded-[12px] bg-white border border-[#E2E5E9]" />,
  }
);

type DateRange = "today" | "7d" | "30d";

export function AnalyticsDashboard() {
  const t = useTranslations("analytics");

  const [range, setRange] = React.useState<DateRange>("today");

  const { data, isLoading, isError, error, refetch } = useAnalytics(range);
  const { data: settings } = useSettings();
  const currency = settings?.currency || "PKR";

  // Error State with Retry
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#10202D]">{t("title")}</h1>
            <p className="text-xs text-[#5F6C79] mt-0.5">{t("subtitle")}</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>{t("error.title")}</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4 mt-2">
            <span>{error instanceof Error ? error.message : t("error.subtitle")}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              className="shrink-0"
            >
              <RefreshCw className="h-4 w-4 me-1.5" />
              {t("error.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Bar with Date Range Control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#10202D]">{t("title")}</h1>
          <p className="text-xs text-[#5F6C79] mt-0.5">{t("subtitle")}</p>
        </div>

        {/* Date Range Control (Today, 7 days, 30 days) */}
        <div className="flex items-center bg-[#ECEEF1] p-1 rounded-[8px] gap-1 self-start sm:self-auto">
          {(["today", "7d", "30d"] as DateRange[]).map((r) => {
            const isActive = range === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5",
                  isActive
                    ? "bg-white text-[#10202D] shadow-xs"
                    : "text-[#5F6C79] hover:text-[#10202D]"
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{t(`ranges.${r}`)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. KPI Cards Row */}
      <AnalyticsKpiRow data={data} currency={currency} isLoading={isLoading} />

      {/* 3. Empty State if No Data */}
      {!isLoading && data && data.orderCount === 0 ? (
        <Card className="py-16 px-4 text-center flex flex-col items-center justify-center bg-white border-[#E2E5E9] rounded-[12px]">
          <div className="h-12 w-12 rounded-full bg-[#ECEEF1] flex items-center justify-center mb-3">
            <BarChart3 className="h-6 w-6 text-[#5F6C79]" />
          </div>
          <h3 className="text-sm font-semibold text-[#10202D]">
            {t("empty.title")}
          </h3>
          <p className="text-xs text-[#5F6C79] max-w-sm mt-1">
            {t("empty.subtitle")}
          </p>
        </Card>
      ) : (
        /* 4. Charts Grid */
        <div className="space-y-6">
          {/* Row 1: Orders per Hour (Bar) + Sales over Time (Area) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading || !data ? (
              <>
                <Skeleton className="h-[340px] w-full rounded-[12px] bg-white border border-[#E2E5E9]" />
                <Skeleton className="h-[340px] w-full rounded-[12px] bg-white border border-[#E2E5E9]" />
              </>
            ) : (
              <>
                <OrdersPerHourChart data={data.ordersPerHour} />
                <SalesOverTimeChart data={data.salesOverTime} currency={currency} />
              </>
            )}
          </div>

          {/* Row 2: Payment Donut + Top Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading || !data ? (
              <>
                <Skeleton className="h-[340px] w-full rounded-[12px] bg-white border border-[#E2E5E9]" />
                <Skeleton className="h-[340px] w-full rounded-[12px] bg-white border border-[#E2E5E9]" />
              </>
            ) : (
              <>
                <PaymentDonutChart data={data.paymentSplit} />
                <TopItemsCard data={data.topItems} currency={currency} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
