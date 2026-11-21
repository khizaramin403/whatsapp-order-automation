"use client";

import { useQuery } from "@tanstack/react-query";
import type { AnalyticsSummary } from "@app/shared";
import { getAnalyticsSummary } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook to fetch analytics summary for the selected date range
 */
export function useAnalytics(range: "today" | "7d" | "30d" = "today") {
  return useQuery<AnalyticsSummary>({
    queryKey: queryKeys.analytics.summary(range),
    queryFn: () => getAnalyticsSummary(range),
  });
}
