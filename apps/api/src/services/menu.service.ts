import { Role } from "@prisma/client";
import {
  menuRepository,
  MenuRepository,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateItemInput,
  UpdateItemInput,
} from "../repositories/menu.repository";
import { AppError } from "../utils/errors";
import { AccessTokenPayload } from "./auth.service";
import { CacheService } from "./cache.service";
import { parsePagination, buildPaginationMeta, PaginationMeta } from "../utils/pagination";

export class MenuService {
  constructor(private readonly menuRepo: MenuRepository = menuRepository) {}

  private getEffectiveRestaurantId(user: AccessTokenPayload): string {
    if (!user.restaurantId) {
      throw AppError.forbidden("No restaurant associated with this user account");
    }
    return user.restaurantId;
  }

  private assertOwnerOrManager(user: AccessTokenPayload): void {
    if (user.role !== Role.owner && user.role !== Role.manager && user.role !== Role.super_admin) {
      throw AppError.forbidden("Only owner and manager can access menu management");
    }
  }

  private async invalidateMenuCache(restaurantId: string): Promise<void> {
    await Promise.all([
      CacheService.del(`cache:menu:categories:${restaurantId}`),
      CacheService.del(`cache:menu:full:${restaurantId}`),
      CacheService.delPattern(`cache:menu:*:${restaurantId}`),
    ]);
  }

  // --- Categories ---

  async getCategories(user: AccessTokenPayload) {
    this.assertOwnerOrManager(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const cacheKey = `cache:menu:categories:${restaurantId}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const categories = await this.menuRepo.findCategories(restaurantId);
    await CacheService.set(cacheKey, categories, 600);
    return categories;
  }

  async getCategoryById(user: AccessTokenPayload, categoryId: string) {
    this.assertOwnerOrManager(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const category = await this.menuRepo.findCategoryById(restaurantId, categoryId);
    if (!category) {
      throw AppError.notFound("Category not found");
    }
    return category;
  }

  async createCategory(user: AccessTokenPayload, input: CreateCategoryInput) {
    this.assertOwnerOrManager(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const created = await this.menuRepo.createCategory(restaurantId, input);
    await this.invalidateMenuCache(restaurantId);
    return created;
  }

  async updateCategory(user: AccessTokenPayload, categoryId: string, input: UpdateCategoryInput) {
    this.assertOwnerOrManager(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const updated = await this.menuRepo.updateCategory(restaurantId, categoryId, input);
    await this.invalidateMenuCache(restaurantId);
    return updated;
  }

  async reorderCategories(
    user: AccessTokenPayload,
    items: { id: string; sort_order: number }[]
  ) {
    this.assertOwnerOrManager(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const result = await this.menuRepo.reorderCategories(restaurantId, items);
    await this.invalidateMenuCache(restaurantId);
    return result;
  }

  async deleteCategory(user: AccessTokenPayload, categoryId: string) {
    this.assertOwnerOrManager(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const result = await this.menuRepo.deleteCategory(restaurantId, categoryId);
    await this.invalidateMenuCache(restaurantId);
    return result;
  }

  // --- Items ---

  async getItems(
    user: AccessTokenPayload,
    query: {
      categoryId?: string;
      isAvailable?: boolean;
      search?: string;
      page?: unknown;
      pageSize?: unknown;
    }
  ): Promise<{ items: unknown[]; meta: PaginationMeta }> {
    this.assertOwnerOrManager(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const { page, pageSize, skip, take } = parsePagination({
      page: query.page,
      pageSize: query.pageSize || 20,
    });

    const [items, total] = await this.menuRepo.findItems(restaurantId, {
      categoryId: query.categoryId,
      isAvailable: query.isAvailable,
      search: query.search,
      skip,
      take,
    });

    const meta = buildPaginationMeta(page, pageSize, total);
    return { items, meta };
  }

  async getItemById(user: AccessTokenPayload, itemId: string) {
    this.assertOwnerOrManager(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const item = await this.menuRepo.findItemById(restaurantId, itemId);
    if (!item) {
      throw AppError.notFound("Menu item not found");
    }
    return item;
  }

  async createItem(user: AccessTokenPayload, input: CreateItemInput) {
    this.assertOwnerOrManager(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const created = await this.menuRepo.createItem(restaurantId, input);
    await this.invalidateMenuCache(restaurantId);
    return created;
  }

  async updateItem(user: AccessTokenPayload, itemId: string, input: UpdateItemInput) {
    this.assertOwnerOrManager(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const updated = await this.menuRepo.updateItem(restaurantId, itemId, input);
    await this.invalidateMenuCache(restaurantId);
    return updated;
  }

  async updateItemAvailability(user: AccessTokenPayload, itemId: string, isAvailable: boolean) {
    this.assertOwnerOrManager(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const updated = await this.menuRepo.updateItemAvailability(restaurantId, itemId, isAvailable);
    await this.invalidateMenuCache(restaurantId);
    return updated;
  }

  async deleteItem(user: AccessTokenPayload, itemId: string) {
    this.assertOwnerOrManager(user);
    const restaurantId = this.getEffectiveRestaurantId(user);

    const result = await this.menuRepo.deleteItem(restaurantId, itemId);
    await this.invalidateMenuCache(restaurantId);
    return result;
  }
}

export const menuService = new MenuService();
