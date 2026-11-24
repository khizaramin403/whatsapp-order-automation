import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { userRepository, UserRepository } from "../repositories/user.repository";
import { tokenRepository, TokenRepository } from "../repositories/token.repository";
import { AppError } from "../utils/errors";

export interface AccessTokenPayload {
  userId: string;
  restaurantId: string | null;
  role: Role;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  language: string;
  avatar_key: string | null;
  restaurant_id: string | null;
  restaurant?: {
    id: string;
    name: string;
  } | null;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: UserSummary;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(
    private readonly userRepo: UserRepository = userRepository,
    private readonly tokenRepo: TokenRepository = tokenRepository
  ) {}

  generateAccessToken(payload: AccessTokenPayload): string {
    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    };
    return jwt.sign(payload, env.JWT_SECRET, options);
  }

  hashRefreshToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  generateRefreshTokenString(): string {
    return crypto.randomBytes(40).toString("hex");
  }

  getRefreshTokenExpiryDate(): Date {
    return new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
  }

  async login(email: string, passwordPlain: string): Promise<LoginResult> {
    const user = await this.userRepo.findByEmail(email);

    // Enforce uniform error message for incorrect email or wrong password to prevent user enumeration
    if (!user) {
      throw AppError.unauthenticated("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(passwordPlain, user.password_hash);
    if (!passwordMatch) {
      throw AppError.unauthenticated("Invalid email or password");
    }

    if (!user.is_active) {
      throw AppError.forbidden("Account is inactive");
    }

    // Generate JWT access token (15 mins)
    const tokenPayload: AccessTokenPayload = {
      userId: user.id,
      restaurantId: user.restaurant_id,
      role: user.role,
    };
    const accessToken = this.generateAccessToken(tokenPayload);

    // Generate and hash 14-day refresh token
    const rawRefreshToken = this.generateRefreshTokenString();
    const tokenHash = this.hashRefreshToken(rawRefreshToken);
    const expiresAt = this.getRefreshTokenExpiryDate();

    await this.tokenRepo.createToken({
      userId: user.id,
      restaurantId: user.restaurant_id,
      tokenHash,
      expiresAt,
    });

    const userSummary: UserSummary = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      avatar_key: user.avatar_key,
      restaurant_id: user.restaurant_id,
    };

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: userSummary,
    };
  }

  async refresh(rawRefreshToken: string | undefined): Promise<RefreshResult> {
    if (!rawRefreshToken || typeof rawRefreshToken !== "string") {
      throw AppError.unauthenticated("Refresh token required");
    }

    const tokenHash = this.hashRefreshToken(rawRefreshToken);
    const tokenRecord = await this.tokenRepo.findByTokenHash(tokenHash);

    if (!tokenRecord) {
      throw AppError.unauthenticated("Invalid refresh token");
    }

    // Reuse detection: if a revoked refresh token is presented again, revoke ALL user sessions
    if (tokenRecord.revoked_at !== null) {
      await this.tokenRepo.revokeAllUserTokens(tokenRecord.user_id);
      throw AppError.unauthenticated("Session revoked due to token reuse", {
        reused: true,
      });
    }

    // Check expiration
    if (tokenRecord.expires_at < new Date()) {
      throw AppError.unauthenticated("Refresh token expired");
    }

    // Check user validity
    const user = await this.userRepo.findById(tokenRecord.user_id);
    if (!user || !user.is_active) {
      throw AppError.unauthenticated("User account not found or inactive");
    }

    // Rotate: Revoke the old token
    await this.tokenRepo.revokeToken(tokenRecord.id);

    // Generate and save new rotated refresh token
    const newRawRefreshToken = this.generateRefreshTokenString();
    const newTokenHash = this.hashRefreshToken(newRawRefreshToken);
    const expiresAt = this.getRefreshTokenExpiryDate();

    await this.tokenRepo.createToken({
      userId: user.id,
      restaurantId: user.restaurant_id,
      tokenHash: newTokenHash,
      expiresAt,
    });

    // Issue new access token
    const accessToken = this.generateAccessToken({
      userId: user.id,
      restaurantId: user.restaurant_id,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (rawRefreshToken && typeof rawRefreshToken === "string") {
      const tokenHash = this.hashRefreshToken(rawRefreshToken);
      const tokenRecord = await this.tokenRepo.findByTokenHash(tokenHash);
      if (tokenRecord && tokenRecord.revoked_at === null) {
        await this.tokenRepo.revokeToken(tokenRecord.id);
      }
    }
  }

  async getCurrentUser(userId: string): Promise<UserSummary> {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.is_active) {
      throw AppError.unauthenticated("User not found or inactive");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      avatar_key: user.avatar_key,
      restaurant_id: user.restaurant_id,
      restaurant: user.restaurant,
    };
  }

  async updateUserLanguage(userId: string, language: string): Promise<{ id: string; language: string }> {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.is_active) {
      throw AppError.unauthenticated("User not found or inactive");
    }

    const updated = await this.userRepo.updateLanguage(userId, language);
    return {
      id: updated.id,
      language: updated.language,
    };
  }
}

export const authService = new AuthService();
