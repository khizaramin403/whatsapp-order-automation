"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { formatMoney } from "@app/shared";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TopItemsCardProps {
  data: { id: string; name: string; quantity: number; revenue: number }[];
  currency?: string;
}

export function TopItemsCard({ data, currency = "PKR" }: TopItemsCardProps) {
  const t = useTranslations("analytics");
  const locale = useLocale();
  const formatLocale = locale === "ar" ? "ar-PK" : "en-PK";

  const maxQuantity = Math.max(...data.map((item) => item.quantity), 1);

  return (
    <Card className="bg-white border-[#E2E5E9] rounded-[12px] shadow-xs flex flex-col">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base font-semibold text-[#10202D]">
          {t("charts.topItems")}
        </CardTitle>
        <CardDescription className="text-xs text-[#5F6C79] mt-0.5">
          {t("charts.topItemsSubtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-3 flex-1 flex flex-col justify-between">
        <div className="space-y-3.5">
          {data.map((item, index) => {
            const isTopOne = index === 0;
            const percent = Math.round((item.quantity / maxQuantity) * 100);

            return (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                        isTopOne
                          ? "bg-[#C7A667] text-[#10202D]"
                          : "bg-[#ECEEF1] text-[#5F6C79]"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="font-semibold text-[#10202D] truncate">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 tabular-nums">
                    <span className="text-[#5F6C79] text-[11px]">
                      {t("charts.quantitySold", { count: item.quantity })}
                    </span>
                    <span className="font-semibold text-[#10202D] min-w-[70px] text-end">
                      {formatMoney(item.revenue, currency, formatLocale)}
                    </span>
                  </div>
                </div>

                {/* Proportional visual bar (Midnight, with Gold for #1) */}
                <div className="h-2 w-full rounded-full bg-[#ECEEF1] overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isTopOne ? "bg-[#C7A667]" : "bg-[#10202D]"
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
