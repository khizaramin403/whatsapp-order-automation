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
  Role,
  SupportedLanguage,
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
    totalPages?: number;
  };
}

export interface MenuResponse {
  categories: MenuCategory[];
  items: MenuItem[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    language: SupportedLanguage;
    avatar_key?: string | null;
    restaurant_id: string | null;
    restaurant?: {
      id: string;
      name: string;
    } | null;
  };
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
  Role,
  SupportedLanguage,
};
