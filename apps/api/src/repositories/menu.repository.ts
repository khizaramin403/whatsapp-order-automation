import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors";

export interface TranslationInput {
  language: "en" | "ar" | "ur-Latn";
  name: string;
  description?: string | null;
  aliases?: string[];
}

export interface CreateCategoryInput {
  sort_order?: number;
  translations: TranslationInput[];
}

export interface UpdateCategoryInput {
  sort_order?: number;
  translations?: TranslationInput[];
}

export interface CreateItemInput {
  category_id: string;
  price: number;
  image_url?: string | null;
  is_available?: boolean;
  sort_order?: number;
  translations: TranslationInput[];
}

export interface UpdateItemInput {
  category_id?: string;
  price?: number;
  image_url?: string | null;
  is_available?: boolean;
  sort_order?: number;
  translations?: TranslationInput[];
}

export class MenuRepository {
  private assertRestaurantId(restaurantId: string): void {
    if (!restaurantId || typeof restaurantId !== "string" || restaurantId.trim() === "") {
      throw AppError.forbidden("Tenant restaurant ID is required for menu repository operations");
    }
  }

  // --- Categories ---

  async findCategories(restaurantId: string) {
    this.assertRestaurantId(restaurantId);

    const categories = await prisma.menuCategory.findMany({
      where: { restaurant_id: restaurantId },
      orderBy: { sort_order: "asc" },
      include: {
        _count: { select: { items: true } },
      },
    });

    const categoryIds = categories.map((c) => c.id);
    const translations = await prisma.menuTranslation.findMany({
      where: {
        restaurant_id: restaurantId,
        entity_type: "category",
        entity_id: { in: categoryIds },
      },
    });

    const translationMap = new Map<string, typeof translations>();
    for (const t of translations) {
      const list = translationMap.get(t.entity_id) || [];
      list.push(t);
      translationMap.set(t.entity_id, list);
    }

    return categories.map((cat) => ({
      ...cat,
      item_count: cat._count.items,
      translations: translationMap.get(cat.id) || [],
    }));
  }

  async findCategoryById(restaurantId: string, categoryId: string) {
    this.assertRestaurantId(restaurantId);

    const category = await prisma.menuCategory.findFirst({
      where: { id: categoryId, restaurant_id: restaurantId },
    });

    if (!category) return null;

    const translations = await prisma.menuTranslation.findMany({
      where: {
        restaurant_id: restaurantId,
        entity_type: "category",
        entity_id: category.id,
      },
    });

    return {
      ...category,
      translations,
    };
  }

  async createCategory(restaurantId: string, input: CreateCategoryInput) {
    this.assertRestaurantId(restaurantId);

    return prisma.$transaction(async (tx) => {
      // Determine sort_order if not provided
      let sortOrder = input.sort_order;
      if (sortOrder === undefined) {
        const lastCat = await tx.menuCategory.findFirst({
          where: { restaurant_id: restaurantId },
          orderBy: { sort_order: "desc" },
          select: { sort_order: true },
        });
        sortOrder = (lastCat?.sort_order ?? 0) + 1;
      }

      const category = await tx.menuCategory.create({
        data: {
          restaurant_id: restaurantId,
          sort_order: sortOrder,
        },
      });

      if (input.translations && input.translations.length > 0) {
        for (const t of input.translations) {
          await tx.menuTranslation.create({
            data: {
              restaurant_id: restaurantId,
              entity_type: "category",
              entity_id: category.id,
              language: t.language,
              name: t.name,
              description: t.description || null,
              aliases: t.aliases || [],
            },
          });
        }
      }

      const allTranslations = await tx.menuTranslation.findMany({
        where: {
          restaurant_id: restaurantId,
          entity_type: "category",
          entity_id: category.id,
        },
      });

      return {
        ...category,
        translations: allTranslations,
      };
    });
  }

  async updateCategory(restaurantId: string, categoryId: string, input: UpdateCategoryInput) {
    this.assertRestaurantId(restaurantId);

    return prisma.$transaction(async (tx) => {
      const existing = await tx.menuCategory.findFirst({
        where: { id: categoryId, restaurant_id: restaurantId },
      });
      if (!existing) {
        throw AppError.notFound("Category not found");
      }

      const updated = await tx.menuCategory.update({
        where: { id: categoryId },
        data: {
          ...(input.sort_order !== undefined ? { sort_order: input.sort_order } : {}),
        },
      });

      if (input.translations) {
        for (const t of input.translations) {
          await tx.menuTranslation.upsert({
            where: {
              restaurant_id_entity_type_entity_id_language: {
                restaurant_id: restaurantId,
                entity_type: "category",
                entity_id: categoryId,
                language: t.language,
              },
            },
            update: {
              name: t.name,
              description: t.description !== undefined ? t.description : undefined,
              aliases: t.aliases !== undefined ? t.aliases : undefined,
            },
            create: {
              restaurant_id: restaurantId,
              entity_type: "category",
              entity_id: categoryId,
              language: t.language,
              name: t.name,
              description: t.description || null,
              aliases: t.aliases || [],
            },
          });
        }
      }

      const translations = await tx.menuTranslation.findMany({
        where: {
          restaurant_id: restaurantId,
          entity_type: "category",
          entity_id: categoryId,
        },
      });

      return {
        ...updated,
        translations,
      };
    });
  }

  async reorderCategories(restaurantId: string, items: { id: string; sort_order: number }[]) {
    this.assertRestaurantId(restaurantId);

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.menuCategory.updateMany({
          where: { id: item.id, restaurant_id: restaurantId },
          data: { sort_order: item.sort_order },
        });
      }
    });

    return this.findCategories(restaurantId);
  }

  async deleteCategory(restaurantId: string, categoryId: string) {
    this.assertRestaurantId(restaurantId);

    return prisma.$transaction(async (tx) => {
      const existing = await tx.menuCategory.findFirst({
        where: { id: categoryId, restaurant_id: restaurantId },
      });
      if (!existing) {
        throw AppError.notFound("Category not found");
      }

      // Delete translations
      await tx.menuTranslation.deleteMany({
        where: {
          restaurant_id: restaurantId,
          entity_type: "category",
          entity_id: categoryId,
        },
      });

      // Delete category (Prisma cascade handles items and their translations can be cleaned)
      const items = await tx.menuItem.findMany({
        where: { category_id: categoryId, restaurant_id: restaurantId },
        select: { id: true },
      });
      const itemIds = items.map((i) => i.id);

      if (itemIds.length > 0) {
        await tx.menuTranslation.deleteMany({
          where: {
            restaurant_id: restaurantId,
            entity_type: "item",
            entity_id: { in: itemIds },
          },
        });
      }

      await tx.menuCategory.delete({
        where: { id: categoryId },
      });

      return { id: categoryId, success: true };
    });
  }

  // --- Items ---

  async findItems(
    restaurantId: string,
    options: {
      categoryId?: string;
      isAvailable?: boolean;
      search?: string;
      skip: number;
      take: number;
    }
  ) {
    this.assertRestaurantId(restaurantId);

    const where: Prisma.MenuItemWhereInput = {
      restaurant_id: restaurantId,
    };

    if (options.categoryId) {
      where.category_id = options.categoryId;
    }

    if (options.isAvailable !== undefined) {
      where.is_available = options.isAvailable;
    }

    // If search is provided, find matching entity_ids in menu_translations or match directly
    if (options.search && options.search.trim()) {
      const term = options.search.trim();
      const matchingTranslations = await prisma.menuTranslation.findMany({
        where: {
          restaurant_id: restaurantId,
          entity_type: "item",
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { aliases: { has: term.toLowerCase() } },
          ],
        },
        select: { entity_id: true },
      });

      const matchingItemIds = matchingTranslations.map((t) => t.entity_id);
      where.id = { in: matchingItemIds };
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
        skip: options.skip,
        take: options.take,
        include: {
          category: {
            select: { id: true, sort_order: true },
          },
        },
      }),
      prisma.menuItem.count({ where }),
    ]);

    const itemIds = items.map((i) => i.id);
    const translations = await prisma.menuTranslation.findMany({
      where: {
        restaurant_id: restaurantId,
        entity_type: "item",
        entity_id: { in: itemIds },
      },
    });

    const translationMap = new Map<string, typeof translations>();
    for (const t of translations) {
      const list = translationMap.get(t.entity_id) || [];
      list.push(t);
      translationMap.set(t.entity_id, list);
    }

    const mappedItems = items.map((item) => ({
      ...item,
      translations: translationMap.get(item.id) || [],
    }));

    return [mappedItems, total] as const;
  }

  async findItemById(restaurantId: string, itemId: string) {
    this.assertRestaurantId(restaurantId);

    const item = await prisma.menuItem.findFirst({
      where: { id: itemId, restaurant_id: restaurantId },
      include: {
        category: {
          select: { id: true, sort_order: true },
        },
      },
    });

    if (!item) return null;

    const translations = await prisma.menuTranslation.findMany({
      where: {
        restaurant_id: restaurantId,
        entity_type: "item",
        entity_id: item.id,
      },
    });

    return {
      ...item,
      translations,
    };
  }

  async createItem(restaurantId: string, input: CreateItemInput) {
    this.assertRestaurantId(restaurantId);

    return prisma.$transaction(async (tx) => {
      // Confirm category belongs to restaurant
      const category = await tx.menuCategory.findFirst({
        where: { id: input.category_id, restaurant_id: restaurantId },
      });
      if (!category) {
        throw AppError.notFound("Category not found for this restaurant");
      }

      let sortOrder = input.sort_order;
      if (sortOrder === undefined) {
        const lastItem = await tx.menuItem.findFirst({
          where: { restaurant_id: restaurantId, category_id: input.category_id },
          orderBy: { sort_order: "desc" },
          select: { sort_order: true },
        });
        sortOrder = (lastItem?.sort_order ?? 0) + 1;
      }

      const item = await tx.menuItem.create({
        data: {
          restaurant_id: restaurantId,
          category_id: input.category_id,
          price: input.price,
          image_url: input.image_url || null,
          is_available: input.is_available ?? true,
          sort_order: sortOrder,
        },
      });

      if (input.translations && input.translations.length > 0) {
        for (const t of input.translations) {
          await tx.menuTranslation.create({
            data: {
              restaurant_id: restaurantId,
              entity_type: "item",
              entity_id: item.id,
              language: t.language,
              name: t.name,
              description: t.description || null,
              aliases: t.aliases || [],
            },
          });
        }
      }

      const translations = await tx.menuTranslation.findMany({
        where: {
          restaurant_id: restaurantId,
          entity_type: "item",
          entity_id: item.id,
        },
      });

      return {
        ...item,
        translations,
      };
    });
  }

  async updateItem(restaurantId: string, itemId: string, input: UpdateItemInput) {
    this.assertRestaurantId(restaurantId);

    return prisma.$transaction(async (tx) => {
      const existing = await tx.menuItem.findFirst({
        where: { id: itemId, restaurant_id: restaurantId },
      });
      if (!existing) {
        throw AppError.notFound("Menu item not found");
      }

      if (input.category_id) {
        const category = await tx.menuCategory.findFirst({
          where: { id: input.category_id, restaurant_id: restaurantId },
        });
        if (!category) {
          throw AppError.notFound("Category not found for this restaurant");
        }
      }

      const updated = await tx.menuItem.update({
        where: { id: itemId },
        data: {
          ...(input.category_id ? { category_id: input.category_id } : {}),
          ...(input.price !== undefined ? { price: input.price } : {}),
          ...(input.image_url !== undefined ? { image_url: input.image_url } : {}),
          ...(input.is_available !== undefined ? { is_available: input.is_available } : {}),
          ...(input.sort_order !== undefined ? { sort_order: input.sort_order } : {}),
        },
      });

      if (input.translations) {
        for (const t of input.translations) {
          await tx.menuTranslation.upsert({
            where: {
              restaurant_id_entity_type_entity_id_language: {
                restaurant_id: restaurantId,
                entity_type: "item",
                entity_id: itemId,
                language: t.language,
              },
            },
            update: {
              name: t.name,
              description: t.description !== undefined ? t.description : undefined,
              aliases: t.aliases !== undefined ? t.aliases : undefined,
            },
            create: {
              restaurant_id: restaurantId,
              entity_type: "item",
              entity_id: itemId,
              language: t.language,
              name: t.name,
              description: t.description || null,
              aliases: t.aliases || [],
            },
          });
        }
      }

      const translations = await tx.menuTranslation.findMany({
        where: {
          restaurant_id: restaurantId,
          entity_type: "item",
          entity_id: itemId,
        },
      });

      return {
        ...updated,
        translations,
      };
    });
  }

  async updateItemAvailability(restaurantId: string, itemId: string, isAvailable: boolean) {
    this.assertRestaurantId(restaurantId);

    const existing = await prisma.menuItem.findFirst({
      where: { id: itemId, restaurant_id: restaurantId },
    });
    if (!existing) {
      throw AppError.notFound("Menu item not found");
    }

    return prisma.menuItem.update({
      where: { id: itemId },
      data: { is_available: isAvailable },
    });
  }

  async deleteItem(restaurantId: string, itemId: string) {
    this.assertRestaurantId(restaurantId);

    return prisma.$transaction(async (tx) => {
      const existing = await tx.menuItem.findFirst({
        where: { id: itemId, restaurant_id: restaurantId },
      });
      if (!existing) {
        throw AppError.notFound("Menu item not found");
      }

      await tx.menuTranslation.deleteMany({
        where: {
          restaurant_id: restaurantId,
          entity_type: "item",
          entity_id: itemId,
        },
      });

      await tx.menuItem.delete({
        where: { id: itemId },
      });

      return { id: itemId, success: true };
    });
  }
}

export const menuRepository = new MenuRepository();
