"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface OrdersPerHourChartProps {
  data: { hour: string; count: number; isPeak?: boolean }[];
}

export function OrdersPerHourChart({ data }: OrdersPerHourChartProps) {
  const t = useTranslations("analytics");

  return (
    <Card className="bg-white border-[#E2E5E9] rounded-[12px] shadow-xs flex flex-col">
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-[#10202D]">
              {t("charts.ordersPerHour")}
            </CardTitle>
            <CardDescription className="text-xs text-[#5F6C79] mt-0.5">
              {t("charts.ordersPerHourSubtitle")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#5F6C79]">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#10202D]" />
              <span>{t("charts.ordersCount")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#C7A667]" />
              <span>{t("charts.peakHour")}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-4 flex-1">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#E2E5E9"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
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
                allowDecimals={false}
              />
              <Tooltip
                isAnimationActive={false}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    const isPeak = item.isPeak;
                    return (
                      <div className="rounded-[8px] border border-[#E2E5E9] bg-white p-3 text-xs shadow-[0_8px_24px_rgba(16,32,45,0.12)]">
                        <div className="font-semibold text-[#10202D] mb-1">{label}</div>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: isPeak ? "#C7A667" : "#10202D" }}
                          />
                          <span className="text-[#5F6C79]">{t("charts.ordersCount")}:</span>
                          <span className="font-semibold text-[#10202D] tabular-nums">
                            {payload[0].value}
                          </span>
                        </div>
                        {isPeak && (
                          <div className="text-[10px] text-[#7A4E0B] bg-[#FBF0DA] px-1.5 py-0.5 rounded mt-1.5 font-medium inline-block">
                            {t("charts.peakHour")}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={300}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isPeak ? "#C7A667" : "#10202D"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
