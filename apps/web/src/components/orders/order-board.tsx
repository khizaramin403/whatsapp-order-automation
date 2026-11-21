"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { TriangleAlert, RefreshCw, Calendar, Inbox } from "lucide-react";
import type { Order, OrderStatus } from "@app/shared";
import { useOrders } from "@/hooks/use-orders";
import { useUI, type OrderFilter } from "@/stores/ui.store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiRow } from "./kpi-row";
import { OrderCard } from "./order-card";
import { cn } from "@/lib/utils";

interface ColumnDef {
  id: string;
  key: "new" | "accepted" | "preparing" | "ready" | "outForDelivery" | "delivered";
  statuses: OrderStatus[];
}

const COLUMNS: ColumnDef[] = [
  { id: "col-new", key: "new", statuses: ["PENDING"] },
  { id: "col-accepted", key: "accepted", statuses: ["ACCEPTED"] },
  { id: "col-preparing", key: "preparing", statuses: ["PREPARING"] },
  { id: "col-ready", key: "ready", statuses: ["READY"] },
  { id: "col-out", key: "outForDelivery", statuses: ["OUT_FOR_DELIVERY"] },
  { id: "col-delivered", key: "delivered", statuses: ["DELIVERED", "COMPLETED"] },
];

export function OrderBoard() {
  const t = useTranslations("orders");

  // Narrow Zustand selectors (PERFORMANCE.md Section 9.2)
  const filter = useUI((s) => s.filter);
  const setFilter = useUI((s) => s.setFilter);

  // Date filter state: "all" vs "today"
  const [dateFilter, setDateFilter] = React.useState<"all" | "today">("all");

  // Force loading for testing skeleton state (?loading=true)
  const forceLoading = React.useSyncExternalStore(
    () => () => {},
    () => window.location.search.includes("loading=true"),
    () => false
  );

  // Delivered column pagination limit (20 per page per requirement 5)
  const [deliveredLimit, setDeliveredLimit] = React.useState(20);

  // Active column tab for mobile views
  const [activeMobileColumn, setActiveMobileColumn] = React.useState<string>("col-new");

  // Fetch orders with TanStack Query
  const {
    data: ordersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrders({
    payment: filter === "all" ? undefined : filter,
    date: dateFilter === "today" ? "today" : undefined,
    pageSize: 100, // get board orders for live view
  });

  const orders = React.useMemo(() => ordersResponse?.data || [], [ordersResponse?.data]);
  const showLoading = isLoading || forceLoading;

  // Group orders into columns
  const columnOrders = React.useMemo(() => {
    const grouped: Record<string, Order[]> = {
      "col-new": [],
      "col-accepted": [],
      "col-preparing": [],
      "col-ready": [],
      "col-out": [],
      "col-delivered": [],
    };

    for (const order of orders) {
      if (order.status === "PENDING") {
        grouped["col-new"].push(order);
      } else if (order.status === "ACCEPTED") {
        grouped["col-accepted"].push(order);
      } else if (order.status === "PREPARING") {
        grouped["col-preparing"].push(order);
      } else if (order.status === "READY") {
        grouped["col-ready"].push(order);
      } else if (order.status === "OUT_FOR_DELIVERY") {
        grouped["col-out"].push(order);
      } else if (order.status === "DELIVERED" || order.status === "COMPLETED") {
        grouped["col-delivered"].push(order);
      }
    }

    return grouped;
  }, [orders]);

  // Error State with Retry
  if (isError) {
    return (
      <div className="space-y-6">
        <KpiRow isLoading={false} orders={[]} />
        <Alert variant="destructive">
          <TriangleAlert className="h-5 w-5" />
          <AlertTitle>{t("error.title")}</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4 mt-2">
            <span>{error instanceof Error ? error.message : t("error.description")}</span>
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
      {/* 1. Row of 4 KPI Cards */}
      <KpiRow orders={orders} isLoading={showLoading} />

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Payment Filter Pills (All, COD, Online) */}
        <div className="flex items-center bg-[#ECEEF1] p-1 rounded-[8px] gap-1">
          {(["all", "cod", "online"] as OrderFilter[]).map((mode) => {
            const isActive = filter === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setFilter(mode)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all cursor-pointer",
                  isActive
                    ? "bg-white text-[#10202D] shadow-xs"
                    : "text-[#5F6C79] hover:text-[#10202D]"
                )}
              >
                {t(`filters.${mode}`)}
              </button>
            );
          })}
        </div>

        {/* Date Filter Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={dateFilter === "today" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setDateFilter((prev) => (prev === "today" ? "all" : "today"))}
            className="text-xs gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5" />
            {dateFilter === "today" ? t("filters.today") : t("filters.allDates")}
          </Button>
        </div>
      </div>

      {/* 3. Mobile Column Selector Strip (under md screens) */}
      <div className="flex md:hidden overflow-x-auto no-scrollbar gap-1.5 border-b border-[#E2E5E9] pb-2">
        {COLUMNS.map((col) => {
          const count = columnOrders[col.id]?.length || 0;
          const isActive = activeMobileColumn === col.id;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => setActiveMobileColumn(col.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5",
                isActive
                  ? "bg-[#10202D] text-[#F7F7F7]"
                  : "bg-white border border-[#E2E5E9] text-[#5F6C79] hover:text-[#10202D]"
              )}
            >
              <span>{t(`columns.${col.key}`)}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  isActive ? "bg-[#C7A667] text-[#10202D]" : "bg-[#ECEEF1] text-[#5F6C79]"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Board Columns */}
      {showLoading ? (
        /* Loading Skeleton Board */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-6 rounded-full" />
              </div>
              <Skeleton className="h-36 w-full rounded-[12px]" />
              <Skeleton className="h-36 w-full rounded-[12px]" />
            </div>
          ))}
        </div>
      ) : (
        /* Live Orders Board */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {COLUMNS.map((col) => {
            const allItems = columnOrders[col.id] || [];
            const count = allItems.length;

            // For delivered column, apply pagination limit
            const isDeliveredCol = col.id === "col-delivered";
            const visibleItems = isDeliveredCol
              ? allItems.slice(0, deliveredLimit)
              : allItems;
            const hasMore = isDeliveredCol && allItems.length > deliveredLimit;

            // For mobile view, hide columns not active on mobile
            const isHiddenOnMobile = activeMobileColumn !== col.id;

            return (
              <div
                key={col.id}
                className={cn(
                  "flex flex-col gap-3 min-w-0",
                  isHiddenOnMobile ? "hidden md:flex" : "flex"
                )}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-1 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#10202D]">
                      {t(`columns.${col.key}`)}
                    </h3>
                    <span className="text-xs font-semibold text-[#5F6C79] bg-[#ECEEF1] px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </div>
                </div>

                {/* Column Cards Container */}
                <div className="space-y-3">
                  {visibleItems.length === 0 ? (
                    /* Empty state for column */
                    <Card className="p-6 text-center border-dashed border-[#D5DAE0] bg-transparent shadow-none">
                      <Inbox className="h-6 w-6 text-[#A9B4BE] mx-auto mb-2" strokeWidth={1.5} />
                      <p className="text-xs text-[#5F6C79]">
                        {t("empty.noOrdersInColumn")}
                      </p>
                    </Card>
                  ) : (
                    visibleItems.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))
                  )}

                  {/* Load More Button for Delivered column */}
                  {hasMore && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs font-medium"
                      onClick={() => setDeliveredLimit((prev) => prev + 20)}
                    >
                      {t("actions.loadMore")}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
