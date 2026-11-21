"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Clock, ChefHat, Check } from "lucide-react";
import type { Order } from "@app/shared";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUpdateOrderStatus } from "@/hooks/use-orders";

interface KitchenCardProps {
  order: Order;
}

function formatRelativeMinutes(
  isoDate: string | Date,
  tK: (key: string, values?: Record<string, string | number>) => string
): string {
  const diffMinutes = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / (1000 * 60)
  );
  if (diffMinutes < 1) {
    return tK("justNow");
  }
  return tK("minutesAgo", { minutes: diffMinutes });
}

export const KitchenCard = React.memo(function KitchenCard({ order }: KitchenCardProps) {
  const t = useTranslations("kitchen");
  const updateStatusMutation = useUpdateOrderStatus();
  const isPending = updateStatusMutation.isPending;

  const handleTransition = (nextStatus: "PREPARING" | "READY") => {
    updateStatusMutation.mutate({ id: order.id, status: nextStatus });
  };

  const isPreparing = order.status === "PREPARING";

  return (
    <Card className="p-5 flex flex-col justify-between bg-white border border-[#E2E5E9] rounded-[12px] shadow-[0_1px_3px_rgba(16,32,45,0.06)] hover:shadow-[0_4px_12px_rgba(16,32,45,0.08)] transition-all">
      <div className="space-y-4">
        {/* Top row: Order Number, elapsed time, and status badge */}
        <div className="flex items-center justify-between gap-3 border-b border-[#E2E5E9] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-bold text-[#10202D] tracking-tight">
              {order.number}
            </span>
            <Badge
              variant={isPreparing ? "info" : "gold"}
              className="text-xs px-2.5 py-0.5"
            >
              {isPreparing ? t("preparing") : t("accepted")}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#5F6C79] shrink-0 font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatRelativeMinutes(order.created_at, t)}</span>
          </div>
        </div>

        {/* Order Type badge (Dine-in or Delivery) - useful for plating/packaging */}
        <div className="flex items-center justify-between text-xs text-[#5F6C79]">
          <span className="font-semibold text-[#10202D] uppercase tracking-wider text-[11px]">
            {t("itemsCount", { count: order.items?.length || 0 })}
          </span>
          <Badge variant="outline" className="text-xs">
            {order.type === "dine_in" ? t("dineIn") : t("delivery")}
          </Badge>
        </div>

        {/* Items and quantities (Large, high-contrast typography for kitchen readability) */}
        {/* NOTE: Strictly NO customer phone, NO payment info, NO address displayed */}
        <div className="divide-y divide-[#E2E5E9] border-y border-[#E2E5E9]">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-start gap-3 text-[#10202D]"
            >
              <span className="text-base font-bold text-[#10202D] bg-[#ECEEF1] px-2.5 py-1 rounded-[6px] shrink-0 leading-none">
                {item.qty}×
              </span>
              <span className="text-base font-semibold leading-snug">
                {item.name_snapshot}
              </span>
            </div>
          ))}
        </div>

        {/* Kitchen Notes (if table note or special instructions exist) */}
        {order.type === "dine_in" && order.address && (
          <div className="p-3 bg-[#FBF0DA] border border-[#F4DCAC] rounded-[8px] space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A4E0B]">
              {t("notes")}
            </span>
            <p className="text-xs font-semibold text-[#7A4E0B]">
              {t("table")}: {order.address}
            </p>
          </div>
        )}
      </div>

      {/* Action Button: Big 44px (h-11) tap target */}
      <div className="pt-5">
        {order.status === "ACCEPTED" ? (
          <Button
            variant="primary"
            className="w-full h-11 text-sm font-semibold rounded-[8px] cursor-pointer"
            loading={isPending}
            onClick={() => handleTransition("PREPARING")}
          >
            <ChefHat className="h-4 w-4 me-2" />
            {t("startPreparing")}
          </Button>
        ) : (
          <Button
            variant="primary"
            className="w-full h-11 text-sm font-semibold rounded-[8px] cursor-pointer bg-[#2F7D5B] hover:bg-[#25684B] text-white"
            loading={isPending}
            onClick={() => handleTransition("READY")}
          >
            <Check className="h-4 w-4 me-2" />
            {t("markReady")}
          </Button>
        )}
      </div>
    </Card>
  );
});
