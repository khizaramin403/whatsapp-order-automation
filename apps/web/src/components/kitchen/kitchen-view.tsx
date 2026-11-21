"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RefreshCw, AlertCircle, Utensils } from "lucide-react";
import type { Order } from "@app/shared";
import { useOrders } from "@/hooks/use-orders";
import { KitchenCard } from "./kitchen-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function KitchenView() {
  const t = useTranslations("kitchen");

  // Force loading for testing skeleton state (?loading=true)
  const forceLoading = React.useSyncExternalStore(
    () => () => {},
    () => typeof window !== "undefined" && window.location.search.includes("loading=true"),
    () => false
  );

  const {
    data: ordersResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useOrders({
    pageSize: 100,
  });

  const allOrders = React.useMemo(() => ordersResponse?.data || [], [ordersResponse?.data]);

  // Filter ONLY orders waiting to be prepared or in preparation
  const kitchenOrders = React.useMemo(() => {
    return allOrders.filter(
      (o: Order) => o.status === "ACCEPTED" || o.status === "PREPARING"
    );
  }, [allOrders]);

  const showLoading = isLoading || forceLoading;

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#10202D] tracking-tight">
              {t("title")}
            </h1>
            <span className="text-xs font-bold text-[#7D6228] bg-[#F4ECDC] px-2.5 py-1 rounded-full">
              {t("activeOrders", { count: kitchenOrders.length })}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5F6C79] mt-1">
            {t("subtitle")}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 me-1.5 ${isFetching ? "animate-spin" : ""}`} />
          {t("retry")}
        </Button>
      </div>

      {/* Main Content */}
      {showLoading ? (
        /* Loading Skeleton Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <Card key={idx} className="p-5 space-y-4 bg-white border-[#E2E5E9] rounded-[12px]">
              <div className="flex justify-between items-center pb-2 border-b border-[#E2E5E9]">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-2.5">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              <Skeleton className="h-11 w-full rounded-[8px] mt-4" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        /* Error State */
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>{t("errorTitle")}</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4 mt-2">
            <span>{error instanceof Error ? error.message : t("errorDesc")}</span>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-3.5 w-3.5 me-1.5" />
              {t("retry")}
            </Button>
          </AlertDescription>
        </Alert>
      ) : kitchenOrders.length === 0 ? (
        /* Empty State */
        <Card className="p-12 text-center border-dashed border-[#D5DAE0] bg-white rounded-[12px]">
          <div className="h-12 w-12 rounded-full bg-[#E6F2EC] text-[#2F7D5B] flex items-center justify-center mx-auto mb-3">
            <Utensils className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <h3 className="text-base font-semibold text-[#10202D]">
            {t("emptyTitle")}
          </h3>
          <p className="text-xs text-[#5F6C79] mt-1 max-w-sm mx-auto">
            {t("emptyDesc")}
          </p>
        </Card>
      ) : (
        /* Active Kitchen Orders List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitchenOrders.map((order) => (
            <KitchenCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
