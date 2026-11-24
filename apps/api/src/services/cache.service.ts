import { redis } from "../config/redis";
import { logger } from "../utils/logger";

export class CacheService {
  private static async getClient() {
    try {
      if (redis.status === "wait") {
        await redis.connect();
      }
      return redis.status === "ready" || redis.status === "connect" ? redis : null;
    } catch {
      return null;
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const client = await this.getClient();
      if (!client) return null;
      const data = await client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      logger.warn({ err, key }, "Cache get failed; proceeding without cache");
      return null;
    }
  }

  static async set(key: string, value: unknown, ttlSeconds = 600): Promise<void> {
    try {
      const client = await this.getClient();
      if (!client) return;
      await client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      logger.warn({ err, key }, "Cache set failed");
    }
  }

  static async del(key: string): Promise<void> {
    try {
      const client = await this.getClient();
      if (!client) return;
      await client.del(key);
    } catch (err) {
      logger.warn({ err, key }, "Cache delete failed");
    }
  }

  static async delPattern(pattern: string): Promise<void> {
    try {
      const client = await this.getClient();
      if (!client) return;
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (err) {
      logger.warn({ err, pattern }, "Cache pattern delete failed");
    }
  }
}
