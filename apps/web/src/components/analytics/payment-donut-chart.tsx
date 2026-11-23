"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface PaymentDonutChartProps {
  data: { method: "cod" | "online"; count: number; percentage: number }[];
}

export function PaymentDonutChart({ data }: PaymentDonutChartProps) {
  const t = useTranslations("analytics");

  const codData = data.find((d) => d.method === "cod") || { count: 0, percentage: 0 };
  const onlineData = data.find((d) => d.method === "online") || { count: 0, percentage: 0 };

  const chartData = [
    { name: t("charts.cod"), value: codData.count, percentage: codData.percentage, color: "#10202D" },
    { name: t("charts.online"), value: onlineData.count, percentage: onlineData.percentage, color: "#C7A667" },
  ];

  return (
    <Card className="bg-white border-[#E2E5E9] rounded-[12px] shadow-xs flex flex-col">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base font-semibold text-[#10202D]">
          {t("charts.paymentSplit")}
        </CardTitle>
        <CardDescription className="text-xs text-[#5F6C79] mt-0.5">
          {t("charts.paymentSplitSubtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-2 flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Donut Container with Center Percentage */}
        <div className="relative h-[220px] w-[220px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                isAnimationActive={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    return (
                      <div className="rounded-[8px] border border-[#E2E5E9] bg-white p-3 text-xs shadow-[0_8px_24px_rgba(16,32,45,0.12)]">
                        <div className="font-semibold text-[#10202D] mb-1">{item.name}</div>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.payload.color }}
                          />
                          <span className="text-[#5F6C79]">
                            {item.payload.percentage}% ({t("charts.ordersUnit", { count: Number(item.value) || 0 })})
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={300}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`donut-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout: Primary percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-semibold text-[#10202D] tabular-nums">
              {codData.percentage}%
            </span>
            <span className="text-[11px] font-medium text-[#5F6C79] uppercase tracking-wider">
              COD
            </span>
          </div>
        </div>

        {/* Direct Labels (No legend hunting!) */}
        <div className="w-full sm:w-auto flex flex-col gap-3 justify-center">
          {/* COD Direct Label Card */}
          <div className="p-3 rounded-[8px] border border-[#E2E5E9] bg-[#F7F7F7] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#10202D] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#10202D]">{t("charts.cod")}</p>
                <p className="text-[11px] text-[#5F6C79]">
                  {t("charts.ordersUnit", { count: codData.count })}
                </p>
              </div>
            </div>
            <div className="text-base font-semibold text-[#10202D] tabular-nums">
              {codData.percentage}%
            </div>
          </div>

          {/* Online Direct Label Card */}
          <div className="p-3 rounded-[8px] border border-[#E2E5E9] bg-[#F7F7F7] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#C7A667] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#10202D]">{t("charts.online")}</p>
                <p className="text-[11px] text-[#5F6C79]">
                  {t("charts.ordersUnit", { count: onlineData.count })}
                </p>
              </div>
            </div>
            <div className="text-base font-semibold text-[#7D6228] tabular-nums">
              {onlineData.percentage}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
