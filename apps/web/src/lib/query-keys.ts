import type { GetOrdersParams } from "./api/types";

export const queryKeys = {
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (filters?: GetOrdersParams) =>
      [...queryKeys.orders.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
  menu: {
    all: ["menu"] as const,
  },
  team: {
    all: ["team"] as const,
  },
  settings: {
    all: ["settings"] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    summary: (range: "today" | "7d" | "30d" = "today") =>
      [...queryKeys.analytics.all, "summary", range] as const,
  },
};
