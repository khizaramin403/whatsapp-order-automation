import { Request, Response, NextFunction } from "express";
import { menuService, MenuService } from "../services/menu.service";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/errors";

export class MenuController {
  constructor(private readonly service: MenuService = menuService) {}

  // --- Categories ---

  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const categories = await this.service.getCategories(req.user);
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const category = await this.service.getCategoryById(req.user, req.params.id);
      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const created = await this.service.createCategory(req.user, req.body);
      sendSuccess(res, created, undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const updated = await this.service.updateCategory(req.user, req.params.id, req.body);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  };

  reorderCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const reordered = await this.service.reorderCategories(req.user, req.body.items);
      sendSuccess(res, reordered);
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const result = await this.service.deleteCategory(req.user, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  // --- Items ---

  getItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const { category_id, is_available, search, page, pageSize } = req.query;

      const isAvailableParsed =
        is_available === "true" ? true : is_available === "false" ? false : undefined;

      const result = await this.service.getItems(req.user, {
        categoryId: typeof category_id === "string" ? category_id : undefined,
        isAvailable: isAvailableParsed,
        search: typeof search === "string" ? search : undefined,
        page,
        pageSize,
      });

      sendSuccess(res, result.items, result.meta);
    } catch (error) {
      next(error);
    }
  };

  getItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const item = await this.service.getItemById(req.user, req.params.id);
      sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  };

  createItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const created = await this.service.createItem(req.user, req.body);
      sendSuccess(res, created, undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const updated = await this.service.updateItem(req.user, req.params.id, req.body);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  };

  updateItemAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const updated = await this.service.updateItemAvailability(
        req.user,
        req.params.id,
        req.body.is_available
      );
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  };

  deleteItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const result = await this.service.deleteItem(req.user, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const menuController = new MenuController();
