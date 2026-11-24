import { prisma } from "../config/prisma";
import { RefreshToken } from "@prisma/client";

export class TokenRepository {
  async createToken(data: {
    userId: string;
    restaurantId: string | null;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        user_id: data.userId,
        restaurant_id: data.restaurantId,
        token_hash: data.tokenHash,
        expires_at: data.expiresAt,
      },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token_hash: tokenHash },
    });
  }

  async revokeToken(id: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { id },
      data: { revoked_at: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<{ count: number }> {
    return prisma.refreshToken.updateMany({
      where: { user_id: userId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }
}

export const tokenRepository = new TokenRepository();
