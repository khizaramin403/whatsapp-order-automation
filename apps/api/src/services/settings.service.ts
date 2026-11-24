import { Role } from "@prisma/client";
import {
  settingsRepository,
  SettingsRepository,
  UpdateSettingsInput,
} from "../repositories/settings.repository";
import { AppError } from "../utils/errors";
import { AccessTokenPayload } from "./auth.service";
import { CacheService } from "./cache.service";

export class SettingsService {
  constructor(private readonly settingsRepo: SettingsRepository = settingsRepository) {}

  private getEffectiveRestaurantId(user: AccessTokenPayload): string {
    if (!user.restaurantId) {
      throw AppError.forbidden("No restaurant associated with this user account");
    }
    return user.restaurantId;
  }

  private assertOwner(user: AccessTokenPayload): void {
    if (user.role !== Role.owner && user.role !== Role.super_admin) {
      throw AppError.forbidden("Only the hotel owner can access settings");
    }
  }

  async getSettings(user: AccessTokenPayload) {
    this.assertOwner(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const cacheKey = `cache:settings:${restaurantId}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const settings = await this.settingsRepo.getSettings(restaurantId);
    await CacheService.set(cacheKey, settings, 600);
    return settings;
  }

  async updateSettings(user: AccessTokenPayload, input: UpdateSettingsInput) {
    this.assertOwner(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const updated = await this.settingsRepo.updateSettings(restaurantId, input);
    await CacheService.del(`cache:settings:${restaurantId}`);
    return updated;
  }
}

export const settingsService = new SettingsService();
