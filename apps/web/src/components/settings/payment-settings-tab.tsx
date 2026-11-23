"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Info } from "lucide-react";
import type { SettingsFormData } from "./types";

export function PaymentSettingsTab() {
  const t = useTranslations("settings");
  const { register } = useFormContext<SettingsFormData>();

  return (
    <div className="space-y-6">
      <div className="rounded-[12px] border border-[#E2E5E9] bg-white p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[#10202D] flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#C7A667]" />
            <span>{t("payments.title")}</span>
          </h2>
          <p className="text-xs text-[#5F6C79] mt-0.5">
            {t("payments.subtitle")}
          </p>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 rounded-[8px] border border-[#E3EDF5] bg-[#E3EDF5]/40 p-4">
          <Info className="h-5 w-5 text-[#1F4C73] shrink-0 mt-0.5" />
          <p className="text-xs text-[#1F4C73] leading-relaxed">
            {t("payments.helpNote")}
          </p>
        </div>

        <div className="space-y-5">
          {/* Account Number / IBAN */}
          <div className="space-y-1.5">
            <Label htmlFor="payment-account" className="text-[13px] font-medium text-[#10202D]">
              {t("payments.accountNumber")}
            </Label>
            <Input
              id="payment-account"
              placeholder={t("payments.accountNumberPlaceholder")}
              {...register("payment_account")}
              className="h-10 border-[#D5DAE0] focus-visible:ring-[#10202D] font-mono text-sm"
            />
          </div>

          {/* Payment Instructions */}
          <div className="space-y-1.5">
            <Label htmlFor="payment-instructions" className="text-[13px] font-medium text-[#10202D]">
              {t("payments.instructions")}
            </Label>
            <textarea
              id="payment-instructions"
              rows={4}
              placeholder={t("payments.instructionsPlaceholder")}
              {...register("payment_instructions")}
              className="w-full rounded-[8px] border border-[#D5DAE0] bg-white p-3 text-sm text-[#10202D] placeholder:text-[#5F6C79] focus:outline-none focus:ring-2 focus:ring-[#10202D] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
