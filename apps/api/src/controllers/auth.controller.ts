import { Request, Response, NextFunction, CookieOptions } from "express";
import { env } from "../config/env";
import { authService, AuthService } from "../services/auth.service";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/errors";

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  private getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
      domain: env.COOKIE_DOMAIN,
    };
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.service.login(email, password);

      res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, this.getCookieOptions());

      sendSuccess(res, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.[env.REFRESH_TOKEN_COOKIE_NAME];
      if (!refreshToken) {
        throw AppError.unauthenticated("Refresh token missing from cookie");
      }

      const result = await this.service.refresh(refreshToken);

      res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, this.getCookieOptions());

      sendSuccess(res, {
        accessToken: result.accessToken,
      });
    } catch (error) {
      // If token reuse or invalid token detected, clear the cookie
      res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/v1/auth",
        domain: env.COOKIE_DOMAIN,
      });
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.[env.REFRESH_TOKEN_COOKIE_NAME];
      await this.service.logout(refreshToken);

      res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/v1/auth",
        domain: env.COOKIE_DOMAIN,
      });

      sendSuccess(res, {
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw AppError.unauthenticated("Authentication required");
      }

      const user = await this.service.getCurrentUser(req.user.userId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  };

  updateLanguage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw AppError.unauthenticated("Authentication required");
      }

      const { language } = req.body;
      const result = await this.service.updateUserLanguage(req.user.userId, language);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
