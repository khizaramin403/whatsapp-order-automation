import type {
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  MenuCategory,
  MenuItem,
  MenuTranslation,
  Restaurant,
  User,
  AnalyticsSummary,
} from "@app/shared";

export interface GetOrdersParams {
  status?: OrderStatus;
  date?: string; // e.g. "today" or YYYY-MM-DD
  payment?: "all" | PaymentMethod;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface MenuResponse {
  categories: MenuCategory[];
  items: MenuItem[];
}

export type {
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  MenuCategory,
  MenuItem,
  MenuTranslation,
  Restaurant,
  User,
  AnalyticsSummary,
};
