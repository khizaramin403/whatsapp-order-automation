import { z } from "zod";

export const RoleSchema = z.enum([
  "super_admin",
  "owner",
  "manager",
  "chef",
  "rider",
]);

export const SupportedLanguageSchema = z.enum(["en", "ar", "ur-Latn"]);

export const OrderStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REJECTED",
  "COMPLETED",
]);

export const PaymentMethodSchema = z.enum(["cod", "online"]);

export const PaymentStatusSchema = z.enum([
  "pending",
  "pending_check",
  "verified",
  "not_received",
  "failed",
]);

export const OrderTypeSchema = z.enum(["delivery", "dine_in", "pickup"]);

// Phone number validator (E.164: + followed by 7 to 15 digits)
export const E164PhoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{6,14}$/, "Phone number must be in E.164 format (+923001234567)");

export const RestaurantSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  timezone: z.string().default("Asia/Karachi"),
  currency: z.string().default("PKR"),
  default_language: SupportedLanguageSchema.default("en"),
  open_hours: z.record(z.any()).nullish(),
  delivery_fee: z.number().int().nonnegative().default(0), // Minor units
  is_active: z.boolean().default(true),
  created_at: z.union([z.date(), z.string()]).optional(),
  updated_at: z.union([z.date(), z.string()]).optional(),
  minimum_order: z.number().int().nonnegative().optional(),
  delivery_area: z.string().nullish(),
  payment_account: z.string().nullish(),
  payment_instructions: z.string().nullish(),
  bot_welcome_en: z.string().nullish(),
  bot_welcome_ar: z.string().nullish(),
  bot_welcome_ur: z.string().nullish(),
  email_notifications: z.boolean().optional(),
  daily_summary_email: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  notification_email: z.string().email().nullish(),
});

export const UserSchema = z.object({
  id: z.string(),
  restaurant_id: z.string().nullable(),
  name: z.string().min(1),
  email: z.string().email(),
  role: RoleSchema,
  language: SupportedLanguageSchema.default("en"),
  avatar_key: z.string().nullable(),
  is_active: z.boolean().default(true),
  created_at: z.union([z.date(), z.string()]).optional(),
  updated_at: z.union([z.date(), z.string()]).optional(),
});

export const MenuTranslationSchema = z.object({
  id: z.string(),
  restaurant_id: z.string(),
  entity_type: z.enum(["category", "item"]),
  entity_id: z.string(),
  language: SupportedLanguageSchema,
  name: z.string().min(1),
  description: z.string().nullable(),
  aliases: z.array(z.string()),
  created_at: z.union([z.date(), z.string()]).optional(),
  updated_at: z.union([z.date(), z.string()]).optional(),
});

export const MenuCategorySchema = z.object({
  id: z.string(),
  restaurant_id: z.string(),
  sort_order: z.number().int().default(0),
  name: z.string().optional(),
  translations: z.array(MenuTranslationSchema).optional(),
  created_at: z.union([z.date(), z.string()]).optional(),
  updated_at: z.union([z.date(), z.string()]).optional(),
});

export const MenuItemSchema = z.object({
  id: z.string(),
  restaurant_id: z.string(),
  category_id: z.string(),
  price: z.number().int().nonnegative(), // Integer minor units
  image_url: z.string().nullable(),
  is_available: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  name: z.string().optional(),
  translations: z.array(MenuTranslationSchema).optional(),
  created_at: z.union([z.date(), z.string()]).optional(),
  updated_at: z.union([z.date(), z.string()]).optional(),
});

export const CustomerSchema = z.object({
  id: z.string(),
  restaurant_id: z.string(),
  phone: E164PhoneSchema,
  name: z.string().min(1),
  language: SupportedLanguageSchema.default("en"),
  last_address: z.string().nullable(),
  created_at: z.union([z.date(), z.string()]).optional(),
  updated_at: z.union([z.date(), z.string()]).optional(),
});

export const OrderItemSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  menu_item_id: z.string(),
  name_snapshot: z.string().min(1),
  price_snapshot: z.number().int().nonnegative(),
  qty: z.number().int().positive(),
});

export const OrderEventSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  status: OrderStatusSchema,
  by_user_id: z.string().nullable(),
  by_user_name: z.string().nullish(),
  note: z.string().nullish(),
  created_at: z.union([z.date(), z.string()]),
});

export const PaymentProofSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  storage_key: z.string(),
  created_at: z.union([z.date(), z.string()]),
});

export const OrderSchema = z.object({
  id: z.string(),
  restaurant_id: z.string(),
  customer_id: z.string(),
  number: z.union([z.string(), z.number()]),
  type: OrderTypeSchema,
  status: OrderStatusSchema,
  payment_method: PaymentMethodSchema,
  payment_status: PaymentStatusSchema,
  subtotal: z.number().int().nonnegative(),
  delivery_fee: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  address: z.string().nullable(),
  scheduled_for: z.union([z.date(), z.string()]).nullable(),
  created_at: z.union([z.date(), z.string()]),
  updated_at: z.union([z.date(), z.string()]).optional(),
  customer: CustomerSchema.optional(),
  items: z.array(OrderItemSchema).optional(),
  events: z.array(OrderEventSchema).optional(),
  payment_proofs: z.array(PaymentProofSchema).optional(),
});
