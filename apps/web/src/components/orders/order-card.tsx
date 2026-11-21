"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Order, OrderStatus } from "@app/shared";
import { formatMoney } from "@app/shared";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUpdateOrderStatus } from "@/hooks/use-orders";
import { useUI } from "@/stores/ui.store";

interface OrderCardProps {
  order: Order;
}

function formatRelativeTime(
  isoDate: string | Date,
  tCard: (key: string, values?: Record<string, string | number>) => string
): string {
  const diffMinutes = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / (1000 * 60)
  );
  if (diffMinutes < 1) {
    return tCard("justNow");
  }
  if (diffMinutes < 60) {
    return tCard("minutesAgo", { minutes: diffMinutes });
  }
  const diffHours = Math.floor(diffMinutes / 60);
  return tCard("hoursAgo", { hours: diffHours });
}

export const OrderCard = React.memo(function OrderCard({ order }: OrderCardProps) {
  const t = useTranslations("orders");
  const tCard = useTranslations("orders.card");
  const tActions = useTranslations("orders.actions");
  const tDialogs = useTranslations("orders.dialogs");
  const locale = useLocale();

  const setSelectedOrderId = useUI((s) => s.setSelectedOrderId);
  const updateStatusMutation = useUpdateOrderStatus();

  const [confirmDialog, setConfirmDialog] = React.useState<"reject" | "cancel" | null>(
    null
  );

  // Items summary text (e.g. "2x Special Chicken Biryani, 1x Garlic Naan")
  const itemsSummary = React.useMemo(() => {
    if (!order.items || order.items.length === 0) {
      return "";
    }
    return order.items
      .map((it) => `${it.qty}x ${it.name_snapshot}`)
      .join(", ");
  }, [order.items]);

  // Handle transition click
  const handleTransition = (nextStatus: OrderStatus) => {
    updateStatusMutation.mutate({ id: order.id, status: nextStatus });
  };

  const handleConfirmAction = () => {
    if (confirmDialog === "reject") {
      updateStatusMutation.mutate({ id: order.id, status: "REJECTED" });
    } else if (confirmDialog === "cancel") {
      updateStatusMutation.mutate({ id: order.id, status: "CANCELLED" });
    }
    setConfirmDialog(null);
  };

  const isPending = updateStatusMutation.isPending;

  return (
    <>
      <Card
        clickable
        onClick={() => setSelectedOrderId(order.id)}
        className="p-4 flex flex-col gap-2.5 bg-white border border-[#E2E5E9] rounded-[12px] shadow-[0_1px_2px_rgba(16,32,45,0.06)] hover:border-[#C7A667] hover:shadow-[0_4px_12px_rgba(16,32,45,0.08)] transition-all duration-150"
      >
        {/* Header row: Order number & Customer name + Time since created */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-sm text-[#10202D] shrink-0">
              {order.number}
            </span>
            <span className="font-semibold text-sm text-[#10202D] truncate">
              {order.customer?.name || "Customer"}
            </span>
          </div>
          <span className="text-[12px] text-[#5F6C79] shrink-0">
            {formatRelativeTime(order.created_at, tCard)}
          </span>
        </div>

        {/* Items summary */}
        <p className="text-[13px] text-[#4A5865] line-clamp-2 leading-relaxed">
          {itemsSummary}
        </p>

        {/* Badge & Total row */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* Payment Badge */}
          {order.payment_method === "cod" ? (
            <Badge variant="neutral">
              {tCard("payment.cod")}
            </Badge>
          ) : order.payment_status === "verified" ? (
            <Badge variant="success" dot>
              {tCard("payment.onlineVerified")}
            </Badge>
          ) : order.payment_status === "pending_check" ? (
            <Badge variant="warning" dot>
              {tCard("payment.onlinePending")}
            </Badge>
          ) : (
            <Badge variant="danger">
              {tCard("payment.onlineUnpaid")}
            </Badge>
          )}

          {/* Formatted Price */}
          <span className="text-sm font-semibold text-[#10202D] tabular-nums">
            {formatMoney(order.total, "PKR", locale === "ar" ? "ar-PK" : "en-PK")}
          </span>
        </div>

        {/* Short Address or Dine-in Note */}
        <p className="text-[12px] text-[#5F6C79] truncate">
          {order.type === "dine_in"
            ? `${tCard("dineIn")} · ${order.address || "Dine-in"}`
            : order.address || tCard("delivery")}
        </p>

        {/* Action button(s) for the next status */}
        <div
          className="pt-1.5 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {order.status === "PENDING" && (
            <>
              {/* Accept is the single Accent / Gold button on screen */}
              <Button
                variant="accent"
                className="flex-1 font-semibold"
                loading={isPending}
                onClick={() => handleTransition("ACCEPTED")}
              >
                {tActions("accept")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#B3392F] hover:bg-[#F8E4E1] hover:text-[#8E2A22]"
                onClick={() => setConfirmDialog("reject")}
              >
                {tActions("reject")}
              </Button>
            </>
          )}

          {order.status === "ACCEPTED" && (
            <>
              <Button
                variant="primary"
                className="flex-1 font-semibold"
                loading={isPending}
                onClick={() => handleTransition("PREPARING")}
              >
                {tActions("startPreparing")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#5F6C79] hover:bg-[#ECEEF1]"
                onClick={() => setConfirmDialog("cancel")}
              >
                {tActions("cancel")}
              </Button>
            </>
          )}

          {order.status === "PREPARING" && (
            <Button
              variant="primary"
              className="w-full font-semibold"
              loading={isPending}
              onClick={() => handleTransition("READY")}
            >
              {tActions("markReady")}
            </Button>
          )}

          {order.status === "READY" && (
            order.type === "delivery" ? (
              <Button
                variant="secondary"
                className="w-full font-semibold"
                loading={isPending}
                onClick={() => handleTransition("OUT_FOR_DELIVERY")}
              >
                {tActions("outForDelivery")}
              </Button>
            ) : (
              <Button
                variant="primary"
                className="w-full font-semibold"
                loading={isPending}
                onClick={() => handleTransition("COMPLETED")}
              >
                {tActions("completeOrder")}
              </Button>
            )
          )}

          {order.status === "OUT_FOR_DELIVERY" && (
            <Button
              variant="primary"
              className="w-full font-semibold"
              loading={isPending}
              onClick={() => handleTransition("DELIVERED")}
            >
              {tActions("markDelivered")}
            </Button>
          )}

          {order.status === "DELIVERED" && (
            <div className="w-full text-center py-1 text-[12px] font-medium text-[#2F7D5B] bg-[#E6F2EC] rounded-[6px]">
              {t("columns.delivered")} ✓
            </div>
          )}

          {order.status === "COMPLETED" && (
            <div className="w-full text-center py-1 text-[12px] font-medium text-[#2F7D5B] bg-[#E6F2EC] rounded-[6px]">
              {tActions("completeOrder")} ✓
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation AlertDialog for Reject or Cancel */}
      <AlertDialog
        open={confirmDialog !== null}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog === "reject"
                ? tDialogs("rejectTitle", { number: String(order.number) })
                : tDialogs("cancelTitle", { number: String(order.number) })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog === "reject"
                ? tDialogs("rejectDesc")
                : tDialogs("cancelDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {confirmDialog === "cancel" ? tDialogs("keepOrder") : t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#B3392F] text-white hover:bg-[#9C2F26]"
              onClick={handleConfirmAction}
            >
              {confirmDialog === "reject"
                ? tDialogs("rejectConfirm")
                : tDialogs("cancelConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
