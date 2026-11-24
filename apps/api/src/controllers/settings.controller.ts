import { Request, Response, NextFunction } from "express";
import { settingsService, SettingsService } from "../services/settings.service";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/errors";

export class SettingsController {
  constructor(private readonly service: SettingsService = settingsService) {}

  getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const settings = await this.service.getSettings(req.user);
      sendSuccess(res, settings);
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const updated = await this.service.updateSettings(req.user, req.body);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  };
}

export const settingsController = new SettingsController();
