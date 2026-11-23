import { z } from "zod";

export const createSettingsSchema = (messages: {
  nameRequired: string;
  deliveryFeePositive: string;
  minOrderPositive: string;
  emailInvalid: string;
}) =>
  z.object({
    name: z.string().min(1, messages.nameRequired),
    timezone: z.string(),
    currency: z.string(),
    default_language: z.enum(["en", "ar", "ur-Latn"] as const),
    delivery_fee: z
      .number({ invalid_type_error: messages.deliveryFeePositive })
      .min(0, messages.deliveryFeePositive),
    minimum_order: z
      .number({ invalid_type_error: messages.minOrderPositive })
      .min(0, messages.minOrderPositive),
    delivery_area: z.string(),
    open_hours: z.record(
      z.object({
        open: z.string(),
        close: z.string(),
        closed: z.boolean().optional(),
      })
    ),
    payment_account: z.string(),
    payment_instructions: z.string(),
    bot_welcome_en: z.string(),
    bot_welcome_ar: z.string(),
    bot_welcome_ur: z.string(),
    bot_payment_en: z.string(),
    bot_payment_ar: z.string(),
    bot_payment_ur: z.string(),
    email_notifications: z.boolean(),
    daily_summary_email: z.boolean(),
    push_notifications: z.boolean(),
    sound_notifications: z.boolean(),
    notification_email: z
      .string()
      .email(messages.emailInvalid)
      .or(z.literal("")),
  });

export type SettingsFormData = z.infer<ReturnType<typeof createSettingsSchema>>;
