import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { menuController } from "../controllers/menu.controller";
import { authenticate, tenant, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { dashboardLimiter } from "../middleware/rateLimiter";

const translationSchema = z.object({
  language: z.enum(["en", "ar", "ur-Latn"], {
    errorMap: () => ({ message: "Language must be en, ar, or ur-Latn" }),
  }),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  aliases: z.array(z.string()).optional(),
});

const createCategorySchema = z.object({
  sort_order: z.number().int().optional(),
  translations: z.array(translationSchema).min(1, "At least one translation is required"),
});

const updateCategorySchema = z.object({
  sort_order: z.number().int().optional(),
  translations: z.array(translationSchema).optional(),
});

const reorderCategoriesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid("Invalid category ID"),
        sort_order: z.number().int(),
      })
    )
    .min(1, "At least one category is required"),
});

const createItemSchema = z.object({
  category_id: z.string().uuid("Invalid category ID"),
  price: z.number().int().nonnegative("Price must be a non-negative integer (minor units)"),
  image_url: z.string().nullable().optional(),
  is_available: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  translations: z.array(translationSchema).min(1, "At least one translation is required"),
});

const updateItemSchema = z.object({
  category_id: z.string().uuid("Invalid category ID").optional(),
  price: z.number().int().nonnegative().optional(),
  image_url: z.string().nullable().optional(),
  is_available: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  translations: z.array(translationSchema).optional(),
});

const updateAvailabilitySchema = z.object({
  is_available: z.boolean({ required_error: "is_available boolean is required" }),
});

const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

const getItemsQuerySchema = z.object({
  category_id: z.string().uuid().optional(),
  is_available: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

export const menuRouter = Router();

// Middleware: Authenticate, tenant isolation, rate limit, role owner or manager
menuRouter.use(
  authenticate,
  tenant,
  dashboardLimiter,
  requireRole(Role.owner, Role.manager, Role.super_admin)
);

// Categories
menuRouter.get("/categories", menuController.getCategories);
menuRouter.post("/categories", validate({ body: createCategorySchema }), menuController.createCategory);
menuRouter.patch(
  "/categories/reorder",
  validate({ body: reorderCategoriesSchema }),
  menuController.reorderCategories
);
menuRouter.get("/categories/:id", validate({ params: idParamSchema }), menuController.getCategoryById);
menuRouter.patch(
  "/categories/:id",
  validate({ params: idParamSchema, body: updateCategorySchema }),
  menuController.updateCategory
);
menuRouter.delete("/categories/:id", validate({ params: idParamSchema }), menuController.deleteCategory);

// Items
menuRouter.get("/items", validate({ query: getItemsQuerySchema }), menuController.getItems);
menuRouter.post("/items", validate({ body: createItemSchema }), menuController.createItem);
menuRouter.get("/items/:id", validate({ params: idParamSchema }), menuController.getItemById);
menuRouter.patch(
  "/items/:id",
  validate({ params: idParamSchema, body: updateItemSchema }),
  menuController.updateItem
);
menuRouter.patch(
  "/items/:id/availability",
  validate({ params: idParamSchema, body: updateAvailabilitySchema }),
  menuController.updateItemAvailability
);
menuRouter.delete("/items/:id", validate({ params: idParamSchema }), menuController.deleteItem);

export default menuRouter;
