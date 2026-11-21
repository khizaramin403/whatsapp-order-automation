"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import {
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  Banknote,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@app/shared";
import { formatMoney } from "@app/shared";
import { useUI } from "@/stores/ui.store";
import {
  useOrder,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from "@/hooks/use-orders";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { cn } from "@/lib/utils";

// Dynamic import for heavy screenshot viewer (PERFORMANCE.md Section 9.3)
const ScreenshotViewer = dynamic(
  () =>
    import("./screenshot-viewer").then((mod) => ({
      default: mod.ScreenshotViewer,
    })),
  { ssr: false }
);

function getStatusLabel(
  status: OrderStatus,
  tCol: (key: string) => string
): string {
  switch (status) {
    case "PENDING":
      return tCol("new");
    case "ACCEPTED":
      return tCol("accepted");
    case "PREPARING":
      return tCol("preparing");
    case "READY":
      return tCol("ready");
    case "OUT_FOR_DELIVERY":
      return tCol("outForDelivery");
    case "DELIVERED":
    case "COMPLETED":
      return tCol("delivered");
    default:
      return status;
  }
}

function getInitials(name?: string | null): string {
  if (!name) return "??";
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??"
  );
}

export function OrderDetailSheet() {
  const t = useTranslations("orders");
  const tDetail = useTranslations("orders.detail");
  const tCard = useTranslations("orders.card");
  const tActions = useTranslations("orders.actions");
  const tDialogs = useTranslations("orders.dialogs");
  const locale = useLocale();

  // Selected order ID from global UI store
  const selectedOrderId = useUI((s) => s.selectedOrderId);
  const setSelectedOrderId = useUI((s) => s.setSelectedOrderId);

  // TanStack Query for full order details
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrder(selectedOrderId);

  // Mutations
  const updateStatusMutation = useUpdateOrderStatus();
  const updatePaymentMutation = useUpdatePaymentStatus();

  // State for screenshot modal
  const [screenshotModalOpen, setScreenshotModalOpen] = React.useState(false);

  // State for confirm dialog (reject / cancel)
  const [confirmDialog, setConfirmDialog] = React.useState<"reject" | "cancel" | null>(
    null
  );

  const isOpen = Boolean(selectedOrderId);
  const handleClose = () => setSelectedOrderId(null);

  const handleStatusTransition = (nextStatus: OrderStatus) => {
    if (!order) return;
    updateStatusMutation.mutate({ id: order.id, status: nextStatus });
  };

  const handlePaymentUpdate = (paymentStatus: PaymentStatus) => {
    if (!order) return;
    updatePaymentMutation.mutate({ id: order.id, paymentStatus });
  };

  const handleConfirmAction = () => {
    if (!order) return;
    if (confirmDialog === "reject") {
      updateStatusMutation.mutate({ id: order.id, status: "REJECTED" });
    } else if (confirmDialog === "cancel") {
      updateStatusMutation.mutate({ id: order.id, status: "CANCELLED" });
    }
    setConfirmDialog(null);
  };

  const isPending =
    updateStatusMutation.isPending || updatePaymentMutation.isPending;

  // Has payment proof screenshot
  const paymentProof = order?.payment_proofs?.[0];

  // Detect mobile view to switch between bottom sheet (<640px) and 480px side sheet
  const isMobile = React.useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia("(max-width: 639px)");
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia("(max-width: 639px)").matches,
    () => false
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={cn(
            "p-0 flex flex-col bg-white border-[#E2E5E9]",
            isMobile
              ? "max-h-[90vh] rounded-t-[16px] border-t"
              : "w-full sm:max-w-[480px] h-full"
          )}
        >
          {/* Sheet Header */}
          <SheetHeader className="p-5 border-b border-[#E2E5E9] bg-white sticky top-0 z-10 shrink-0">
            <div className="flex items-center justify-between pe-6">
              <div className="flex items-center gap-2.5">
                <SheetTitle className="text-lg font-semibold text-[#10202D]">
                  {order ? order.number : <Skeleton className="h-6 w-20" />}
                </SheetTitle>
                {order && (
                  <Badge
                    variant={
                      order.status === "DELIVERED" || order.status === "COMPLETED"
                        ? "success"
                        : order.status === "PENDING"
                        ? "warning"
                        : order.status === "CANCELLED" || order.status === "REJECTED"
                        ? "danger"
                        : order.status === "ACCEPTED"
                        ? "gold"
                        : "info"
                    }
                  >
                    {getStatusLabel(order.status, (k) => t(`columns.${k}`))}
                  </Badge>
                )}
              </div>

              {order && (
                <Badge variant="outline" className="text-xs">
                  {order.type === "dine_in"
                    ? tCard("dineIn")
                    : order.type === "pickup"
                    ? tCard("pickup")
                    : tCard("delivery")}
                </Badge>
              )}
            </div>
          </SheetHeader>

          {/* Scrollable Sheet Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-[#10202D]">
            {isLoading ? (
              /* Loading Skeleton */
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="space-y-2 pt-2 border-t border-[#E2E5E9]">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-12 w-full rounded-[8px]" />
                  <Skeleton className="h-12 w-full rounded-[8px]" />
                </div>
                <div className="space-y-2 pt-2 border-t border-[#E2E5E9]">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20 w-full rounded-[8px]" />
                </div>
              </div>
            ) : isError ? (
              /* Error State */
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>{t("error.title")}</AlertTitle>
                <AlertDescription className="flex items-center justify-between gap-4 mt-2">
                  <span>
                    {error instanceof Error ? error.message : t("error.description")}
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => refetch()}>
                    <RotateCcw className="h-4 w-4 me-1.5" />
                    {t("error.retry")}
                  </Button>
                </AlertDescription>
              </Alert>
            ) : order ? (
              <>
                {/* 1. Customer Information */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7F8C98]">
                    {tDetail("customer")}
                  </p>
                  <div className="bg-[#F7F7F7] p-3.5 rounded-[8px] border border-[#E2E5E9] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#10202D]">
                        {order.customer?.name}
                      </span>
                      {order.customer?.phone && (
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7D6228] hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>{order.customer.phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Address / Table */}
                    <div className="flex items-start gap-2 text-xs text-[#4A5865] pt-1">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#5F6C79]" />
                      <span>
                        {order.type === "dine_in"
                          ? `${tDetail("table")}: ${order.address || "Dine-in"}`
                          : order.address}
                      </span>
                    </div>

                    {/* Scheduled / Timing */}
                    <div className="flex items-center gap-2 text-xs text-[#5F6C79]">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {order.scheduled_for
                          ? `${tDetail("scheduledTime")}: ${new Date(
                              order.scheduled_for
                            ).toLocaleString(locale)}`
                          : tDetail("immediate")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Items List */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7F8C98]">
                    {tDetail("items")}
                  </p>
                  <div className="divide-y divide-[#E2E5E9] border-y border-[#E2E5E9]">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0 pe-2">
                          <span className="font-semibold text-xs text-[#10202D] bg-[#ECEEF1] px-1.5 py-0.5 rounded shrink-0">
                            {item.qty}x
                          </span>
                          <span className="truncate text-[#10202D]">
                            {item.name_snapshot}
                          </span>
                        </div>
                        <span className="font-medium text-[#10202D] tabular-nums shrink-0">
                          {formatMoney(
                            item.price_snapshot * item.qty,
                            "PKR",
                            locale === "ar" ? "ar-PK" : "en-PK"
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-[#F7F7F7] p-3.5 rounded-[8px] space-y-1.5 text-xs text-[#4A5865]">
                    <div className="flex justify-between">
                      <span>{tDetail("subtotal")}</span>
                      <span className="tabular-nums">
                        {formatMoney(
                          order.subtotal,
                          "PKR",
                          locale === "ar" ? "ar-PK" : "en-PK"
                        )}
                      </span>
                    </div>
                    {order.delivery_fee > 0 && (
                      <div className="flex justify-between">
                        <span>{tDetail("deliveryFee")}</span>
                        <span className="tabular-nums">
                          {formatMoney(
                            order.delivery_fee,
                            "PKR",
                            locale === "ar" ? "ar-PK" : "en-PK"
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-sm text-[#10202D] pt-1 border-t border-[#E2E5E9]">
                      <span>{tDetail("total")}</span>
                      <span className="tabular-nums text-base">
                        {formatMoney(
                          order.total,
                          "PKR",
                          locale === "ar" ? "ar-PK" : "en-PK"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Payment Method & Screenshot Proof */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7F8C98]">
                    {tDetail("paymentDetails")}
                  </p>
                  <div className="bg-[#F7F7F7] p-3.5 rounded-[8px] border border-[#E2E5E9] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[#10202D]">
                        {order.payment_method === "cod" ? (
                          <>
                            <Banknote className="h-4 w-4 text-[#5F6C79]" />
                            <span>{tCard("payment.cod")}</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 text-[#7D6228]" />
                            <span>{tDetail("onlineBank")}</span>
                          </>
                        )}
                      </div>

                      <Badge
                        variant={
                          order.payment_status === "verified"
                            ? "success"
                            : order.payment_status === "pending_check"
                            ? "warning"
                            : order.payment_status === "not_received"
                            ? "danger"
                            : "neutral"
                        }
                      >
                        {order.payment_status === "verified"
                          ? tCard("payment.onlineVerified")
                          : order.payment_status === "pending_check"
                          ? tCard("payment.onlinePending")
                          : order.payment_status === "not_received"
                          ? tCard("payment.onlineUnpaid")
                          : tCard("payment.cod")}
                      </Badge>
                    </div>

                    {/* Screenshot Proof Preview if available */}
                    {paymentProof && (
                      <div className="pt-2 border-t border-[#E2E5E9] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#10202D]">
                            {tDetail("paymentProof")}
                          </span>
                          <button
                            type="button"
                            onClick={() => setScreenshotModalOpen(true)}
                            className="text-xs text-[#7D6228] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            {tDetail("viewScreenshot")}
                          </button>
                        </div>

                        {/* Clickable thumbnail */}
                        <div
                          onClick={() => setScreenshotModalOpen(true)}
                          className="relative h-28 w-full rounded-[6px] border border-[#D5DAE0] overflow-hidden bg-white cursor-pointer hover:border-[#C7A667] transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={paymentProof.storage_key}
                            alt="Payment receipt proof"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Action Buttons for Online Payment Proof */}
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 text-xs border-[#2F7D5B] text-[#1F5C42] hover:bg-[#E6F2EC]"
                            loading={isPending}
                            onClick={() => handlePaymentUpdate("verified")}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 me-1" />
                            {tDetail("verifyPayment")}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 text-xs border-[#B3392F] text-[#8E2A22] hover:bg-[#F8E4E1]"
                            loading={isPending}
                            onClick={() => handlePaymentUpdate("not_received")}
                          >
                            <XCircle className="h-3.5 w-3.5 me-1" />
                            {tDetail("notReceived")}
                          </Button>
                        </div>

                        {/* Disclaimer note */}
                        <p className="text-[11px] text-[#5F6C79] leading-relaxed italic">
                          {tDetail("screenshotDisclaimer")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Timeline built from order events */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7F8C98]">
                    {tDetail("timeline")}
                  </p>
                  <div className="relative ps-4 ms-2 space-y-4 border-s-2 border-[#E2E5E9]">
                    {order.events?.map((evt, idx) => (
                      <div key={evt.id || idx} className="relative group">
                        {/* Dot / Avatar on line */}
                        <div className="absolute -start-[25px] top-0 flex items-center justify-center">
                          <Avatar size="sm" className="h-6 w-6 border-2 border-white shadow-xs">
                            <AvatarFallback className="text-[9px]">
                              {getInitials(evt.by_user_name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Event Content */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#10202D]">
                              {evt.by_user_name || "System"}
                            </span>
                            <span className="text-[11px] text-[#5F6C79]">
                              {new Date(evt.created_at).toLocaleTimeString(locale, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-[#4A5865]">
                            {evt.note || evt.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Sticky Action Footer */}
          {order && (
            <div className="p-4 bg-white border-t border-[#E2E5E9] sticky bottom-0 z-10 shrink-0 flex items-center gap-2">
              {order.status === "PENDING" && (
                <>
                  <Button
                    variant="accent"
                    className="flex-1 font-semibold"
                    loading={isPending}
                    onClick={() => handleStatusTransition("ACCEPTED")}
                  >
                    {tActions("accept")}
                  </Button>
                  <Button
                    variant="ghost"
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
                    onClick={() => handleStatusTransition("PREPARING")}
                  >
                    {tActions("startPreparing")}
                  </Button>
                  <Button
                    variant="ghost"
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
                  onClick={() => handleStatusTransition("READY")}
                >
                  {tActions("markReady")}
                </Button>
              )}

              {order.status === "READY" &&
                (order.type === "delivery" ? (
                  <Button
                    variant="secondary"
                    className="w-full font-semibold"
                    loading={isPending}
                    onClick={() => handleStatusTransition("OUT_FOR_DELIVERY")}
                  >
                    {tActions("outForDelivery")}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full font-semibold"
                    loading={isPending}
                    onClick={() => handleStatusTransition("COMPLETED")}
                  >
                    {tActions("completeOrder")}
                  </Button>
                ))}

              {order.status === "OUT_FOR_DELIVERY" && (
                <Button
                  variant="primary"
                  className="w-full font-semibold"
                  loading={isPending}
                  onClick={() => handleStatusTransition("DELIVERED")}
                >
                  {tActions("markDelivered")}
                </Button>
              )}

              {(order.status === "DELIVERED" || order.status === "COMPLETED") && (
                <div className="w-full text-center py-2 text-xs font-semibold text-[#2F7D5B] bg-[#E6F2EC] rounded-[8px]">
                  {order.status === "DELIVERED"
                    ? t("columns.delivered")
                    : tActions("completeOrder")}{" "}
                  ✓
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dynamic Screenshot Viewer Dialog */}
      {paymentProof && (
        <ScreenshotViewer
          isOpen={screenshotModalOpen}
          onClose={() => setScreenshotModalOpen(false)}
          imageUrl={paymentProof.storage_key}
          orderNumber={order?.number || ""}
        />
      )}

      {/* Confirmation AlertDialog for Reject or Cancel */}
      <AlertDialog
        open={confirmDialog !== null}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog === "reject"
                ? tDialogs("rejectTitle", { number: String(order?.number || "") })
                : tDialogs("cancelTitle", { number: String(order?.number || "") })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog === "reject"
                ? tDialogs("rejectDesc")
                : tDialogs("cancelDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {confirmDialog === "cancel"
                ? tDialogs("keepOrder")
                : tDetail("close")}
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
}
