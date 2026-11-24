import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors";

export interface UpdateSettingsInput {
  name?: string;
  timezone?: string;
  currency?: string;
  default_language?: string;
  open_hours?: unknown;
  delivery_fee?: number;
  minimum_order?: number;
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

export class SettingsRepository {
  private assertRestaurantId(restaurantId: string): void {
    if (!restaurantId || typeof restaurantId !== "string" || restaurantId.trim() === "") {
      throw AppError.forbidden("Tenant restaurant ID is required for settings operations");
    }
  }

  async getSettings(restaurantId: string) {
    this.assertRestaurantId(restaurantId);

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        timezone: true,
        currency: true,
        default_language: true,
        open_hours: true,
        delivery_fee: true,
        minimum_order: true,
        delivery_area: true,
        payment_account: true,
        payment_instructions: true,
        bot_welcome_en: true,
        bot_welcome_ar: true,
        bot_welcome_ur: true,
        bot_payment_en: true,
        bot_payment_ar: true,
        bot_payment_ur: true,
        email_notifications: true,
        daily_summary_email: true,
        push_notifications: true,
        sound_notifications: true,
        notification_email: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!restaurant) {
      throw AppError.notFound("Restaurant not found");
    }

    return restaurant;
  }

  async updateSettings(restaurantId: string, input: UpdateSettingsInput) {
    this.assertRestaurantId(restaurantId);

    const existing = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!existing) {
      throw AppError.notFound("Restaurant not found");
    }

    return prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.default_language !== undefined ? { default_language: input.default_language } : {}),
        ...(input.open_hours !== undefined
          ? { open_hours: input.open_hours as Prisma.InputJsonValue }
          : {}),
        ...(input.delivery_fee !== undefined ? { delivery_fee: input.delivery_fee } : {}),
        ...(input.minimum_order !== undefined ? { minimum_order: input.minimum_order } : {}),
        ...(input.delivery_area !== undefined ? { delivery_area: input.delivery_area } : {}),
        ...(input.payment_account !== undefined ? { payment_account: input.payment_account } : {}),
        ...(input.payment_instructions !== undefined
          ? { payment_instructions: input.payment_instructions }
          : {}),
        ...(input.bot_welcome_en !== undefined ? { bot_welcome_en: input.bot_welcome_en } : {}),
        ...(input.bot_welcome_ar !== undefined ? { bot_welcome_ar: input.bot_welcome_ar } : {}),
        ...(input.bot_welcome_ur !== undefined ? { bot_welcome_ur: input.bot_welcome_ur } : {}),
        ...(input.bot_payment_en !== undefined ? { bot_payment_en: input.bot_payment_en } : {}),
        ...(input.bot_payment_ar !== undefined ? { bot_payment_ar: input.bot_payment_ar } : {}),
        ...(input.bot_payment_ur !== undefined ? { bot_payment_ur: input.bot_payment_ur } : {}),
        ...(input.email_notifications !== undefined
          ? { email_notifications: input.email_notifications }
          : {}),
        ...(input.daily_summary_email !== undefined
          ? { daily_summary_email: input.daily_summary_email }
          : {}),
        ...(input.push_notifications !== undefined
          ? { push_notifications: input.push_notifications }
          : {}),
        ...(input.sound_notifications !== undefined
          ? { sound_notifications: input.sound_notifications }
          : {}),
        ...(input.notification_email !== undefined
          ? { notification_email: input.notification_email }
          : {}),
      },
    });
  }
}

export const settingsRepository = new SettingsRepository();
