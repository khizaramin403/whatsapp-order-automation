"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Phone, Banknote, Bike, CheckCircle2 } from "lucide-react";
import type { Order } from "@app/shared";
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

interface DeliveryCardProps {
  order: Order;
}

export const DeliveryCard = React.memo(function DeliveryCard({ order }: DeliveryCardProps) {
  const t = useTranslations("delivery");
  const locale = useLocale();

  const updateStatusMutation = useUpdateOrderStatus();
  const isPending = updateStatusMutation.isPending;

  // Confirmation dialog for the last step ("Delivered")
  const [confirmDeliveryOpen, setConfirmDeliveryOpen] = React.useState(false);

  const handleStartDelivery = () => {
    updateStatusMutation.mutate({ id: order.id, status: "OUT_FOR_DELIVERY" });
  };

  const handleConfirmDelivered = () => {
    updateStatusMutation.mutate({ id: order.id, status: "DELIVERED" });
    setConfirmDeliveryOpen(false);
  };

  const isReady = order.status === "READY";
  const isCOD = order.payment_method === "cod";

  const formattedTotal = formatMoney(
    order.total,
    "PKR",
    locale === "ar" ? "ar-PK" : "en-PK"
  );

  return (
    <>
      <Card className="p-5 flex flex-col justify-between bg-white border border-[#E2E5E9] rounded-[12px] shadow-[0_1px_3px_rgba(16,32,45,0.06)] hover:shadow-[0_4px_12px_rgba(16,32,45,0.08)] transition-all">
        <div className="space-y-4">
          {/* Header row: Order number & status badge */}
          <div className="flex items-center justify-between gap-3 border-b border-[#E2E5E9] pb-3">
            <span className="text-xl font-bold text-[#10202D] tracking-tight">
              {order.number}
            </span>

            <Badge
              variant={isReady ? "success" : "info"}
              className="text-xs px-2.5 py-0.5"
            >
              {isReady ? t("ready") : t("outForDelivery")}
            </Badge>
          </div>

          {/* Customer info & Phone call link */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F8C98]">
                {t("customer")}
              </span>
              <p className="text-base font-semibold text-[#10202D]">
                {order.customer?.name}
              </p>
            </div>

            {order.customer?.phone && (
              <a
                href={`tel:${order.customer.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#F2F4F6] text-xs font-semibold text-[#7D6228] hover:bg-[#EAEFF4] transition-colors shrink-0 cursor-pointer min-h-[44px]"
                aria-label={`Call ${order.customer.name}`}
              >
                <Phone className="h-4 w-4" />
                <span>{t("call")}</span>
              </a>
            )}
          </div>

          {/* Delivery Address (large, readable for rider on the move) */}
          <div className="p-3 bg-[#F7F7F7] rounded-[8px] border border-[#E2E5E9] flex items-start gap-2.5 text-[#10202D]">
            <MapPin className="h-4 w-4 text-[#5F6C79] shrink-0 mt-0.5" />
            <div className="space-y-0.5 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F8C98]">
                {t("address")}
              </span>
              <p className="text-sm font-medium leading-relaxed break-words">
                {order.address}
              </p>
            </div>
          </div>

          {/* Items Summary (so rider knows what food packages are in the order) */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F8C98]">
              {t("items")}
            </span>
            <div className="text-xs text-[#4A5865] space-y-0.5">
              {order.items?.map((it) => (
                <div key={it.id} className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#10202D]">{it.qty}×</span>
                  <span className="truncate">{it.name_snapshot}</span>
                </div>
              ))}
            </div>
          </div>

          {/* "Cash to collect: Rs X" ONLY if payment is COD */}
          {isCOD && (
            <div className="p-3.5 bg-[#F4ECDC] border border-[#C7A667] rounded-[8px] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#7D6228]">
                <Banknote className="h-5 w-5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t("cashToCollect", { amount: "" }).replace(":", "")}
                </span>
              </div>
              <span className="text-base font-bold text-[#10202D] tabular-nums">
                {formattedTotal}
              </span>
            </div>
          )}
        </div>

        {/* Action Button: Big 44px (h-11) tap target */}
        <div className="pt-5">
          {isReady ? (
            <Button
              variant="secondary"
              className="w-full h-11 text-sm font-semibold rounded-[8px] cursor-pointer border-[#D5DAE0]"
              loading={isPending}
              onClick={handleStartDelivery}
            >
              <Bike className="h-4 w-4 me-2" />
              {t("startDelivery")}
            </Button>
          ) : (
            <Button
              variant="primary"
              className="w-full h-11 text-sm font-semibold rounded-[8px] cursor-pointer bg-[#2F7D5B] hover:bg-[#25684B] text-white"
              loading={isPending}
              onClick={() => setConfirmDeliveryOpen(true)}
            >
              <CheckCircle2 className="h-4 w-4 me-2" />
              {t("markDelivered")}
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation AlertDialog for the last step ("Delivered") */}
      <AlertDialog
        open={confirmDeliveryOpen}
        onOpenChange={setConfirmDeliveryOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("confirmDialogTitle", { number: order.number })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isCOD
                ? t("confirmDialogDesc", {
                    customer: order.customer?.name || "Customer",
                    amount: formattedTotal,
                  })
                : t("confirmDialogDescOnline", {
                    customer: order.customer?.name || "Customer",
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancelBtn")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#2F7D5B] text-white hover:bg-[#25684B]"
              onClick={handleConfirmDelivered}
            >
              {t("confirmDeliveredBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
