"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMoney } from "@app/shared";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface SalesOverTimeChartProps {
  data: { date: string; sales: number }[];
  currency?: string;
}

export function SalesOverTimeChart({
  data,
  currency = "PKR",
}: SalesOverTimeChartProps) {
  const t = useTranslations("analytics");
  const locale = useLocale();
  const formatLocale = locale === "ar" ? "ar-PK" : "en-PK";

  return (
    <Card className="bg-white border-[#E2E5E9] rounded-[12px] shadow-xs flex flex-col">
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-[#10202D]">
              {t("charts.salesOverTime")}
            </CardTitle>
            <CardDescription className="text-xs text-[#5F6C79] mt-0.5">
              {t("charts.salesOverTimeSubtitle")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#5F6C79]">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-[#10202D] border border-[#10202D]" />
            <span>{t("charts.revenue")}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-4 flex-1">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#E2E5E9"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#5F6C79"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                stroke="#5F6C79"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  if (val >= 10000000) return `${(val / 10000000).toFixed(0)}k`;
                  if (val >= 100000) return `${(val / 100000).toFixed(0)}k`;
                  return `${val}`;
                }}
              />
              <Tooltip
                isAnimationActive={false}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const sales = payload[0].value as number;
                    return (
                      <div className="rounded-[8px] border border-[#E2E5E9] bg-white p-3 text-xs shadow-[0_8px_24px_rgba(16,32,45,0.12)]">
                        <div className="font-semibold text-[#10202D] mb-1">{label}</div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#10202D]" />
                          <span className="text-[#5F6C79]">{t("charts.revenue")}:</span>
                          <span className="font-semibold text-[#10202D] tabular-nums">
                            {formatMoney(sales, currency, formatLocale)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Solid midnight line with gold tint solid fill per DESIGN.md: No gradients */}
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#10202D"
                strokeWidth={2}
                fill="#F4ECDC"
                fillOpacity={0.9}
                isAnimationActive={true}
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
