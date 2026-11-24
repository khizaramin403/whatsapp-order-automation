// Shared TypeScript types for WhatsApp Order Automation
// References: PROJECT_PLAN_v1.1 Sections 9.5, 10.2, 11

export type Role = "super_admin" | "owner" | "manager" | "chef" | "rider";

export type SupportedLanguage = "en" | "ar" | "ur-Latn";

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REJECTED"
  | "COMPLETED";

export type PaymentMethod = "cod" | "online";

export type PaymentStatus =
  | "pending"
  | "pending_check"
  | "verified"
  | "not_received"
  | "failed";

export type OrderType = "delivery" | "dine_in" | "pickup";

export interface Restaurant {
  id: string;
  name: string;
  timezone: string;
  currency: string;
  default_language: SupportedLanguage;
  open_hours?: Record<string, { open: string; close: string; closed?: boolean }> | null;
  delivery_fee: number; // Integer minor units (e.g. 15000 for Rs 150.00)
  is_active: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
  // Extended configuration fields for dashboard settings
  minimum_order?: number; // Integer minor units
  delivery_area?: string | null;
  payment_account?: string | null;
  payment_instructions?: string | null;
  bot_welcome_en?: string | null;
  bot_welcome_ar?: string | null;
  bot_welcome_ur?: string | null;
  bot_payment_en?: string | null;
  bot_payment_ar?: string | null;
  bot_payment_ur?: string | null;
  email_notifications?: boolean;
  daily_summary_email?: boolean;
  push_notifications?: boolean;
  sound_notifications?: boolean;
  notification_email?: string | null;
}

export interface User {
  id: string;
  restaurant_id: string | null; // null for super_admin
  name: string;
  email: string;
  role: Role;
  language: SupportedLanguage;
  avatar_key: string | null;
  is_active: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  sort_order: number;
  name?: string; // Resolved name for current locale
  translations?: MenuTranslation[];
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  price: number; // Integer minor units (e.g. 58000 for Rs 580.00)
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
  name?: string; // Resolved name for current locale
  translations?: MenuTranslation[];
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface MenuTranslation {
  id: string;
  restaurant_id: string;
  entity_type: "category" | "item";
  entity_id: string;
  language: SupportedLanguage;
  name: string;
  description: string | null;
  aliases: string[]; // Aliases/tags for WhatsApp bot matching
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface Customer {
  id: string;
  restaurant_id: string;
  phone: string; // E.164 (+923001234567)
  name: string;
  language: SupportedLanguage;
  last_address: string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name_snapshot: string;
  price_snapshot: number; // Integer minor units
  qty: number;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  status: OrderStatus;
  by_user_id: string | null;
  by_user_name?: string | null;
  note?: string | null;
  created_at: Date | string;
}

export interface PaymentProof {
  id: string;
  order_id: string;
  storage_key: string;
  created_at: Date | string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  customer_id: string;
  number: string | number;
  type: OrderType;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number; // Integer minor units
  delivery_fee: number; // Integer minor units
  total: number; // Integer minor units
  address: string | null;
  scheduled_for: Date | string | null;
  created_at: Date | string;
  updated_at?: Date | string;

  // Embedded relations for dashboard presentation
  customer?: Customer;
  items?: OrderItem[];
  events?: OrderEvent[];
  payment_proofs?: PaymentProof[];
  cash_to_collect?: number; // Role-shaped field for riders on COD orders
}

export interface AnalyticsSummary {
  range: "today" | "7d" | "30d";
  totalSales: number; // Integer minor units
  orderCount: number;
  averageOrderValue: number; // Integer minor units
  codShare: number; // Fraction between 0 and 1 (e.g. 0.65)
  ordersPerHour: Array<{ hour: string; count: number; isPeak?: boolean }>;
  salesOverTime: Array<{ date: string; sales: number }>;
  paymentSplit: Array<{ method: PaymentMethod; count: number; percentage: number }>;
  topItems: Array<{ id: string; name: string; quantity: number; revenue: number }>;
}
