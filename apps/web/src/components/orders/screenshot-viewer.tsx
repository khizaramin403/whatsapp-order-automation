"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

interface ScreenshotViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  orderNumber: string | number;
}

export function ScreenshotViewer({
  isOpen,
  onClose,
  imageUrl,
  orderNumber,
}: ScreenshotViewerProps) {
  const t = useTranslations("orders.detail");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-xl p-6 bg-white border border-[#E2E5E9]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base font-semibold text-[#10202D]">
            {t("paymentProof")} - {orderNumber}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#5F6C79]">
            {t("screenshotDisclaimer")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center bg-[#F7F7F7] rounded-[8px] p-2 border border-[#E2E5E9] overflow-hidden max-h-[70vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`Payment proof for order ${orderNumber}`}
            className="w-full max-h-[60vh] object-contain rounded"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
