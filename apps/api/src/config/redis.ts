import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    if (env.NODE_ENV === "test") {
      return null;
    }
    if (times > 10) {
      logger.warn(`Redis retry limit reached (${times} attempts).`);
      return null;
    }
    return Math.min(times * 150, 2000);
  },
});

redis.on("error", (err) => {
  if (env.NODE_ENV !== "test") {
    logger.error({ err }, "Redis connection error");
  }
});

redis.on("connect", () => {
  logger.info("Connected to Redis");
});

export async function closeRedis(): Promise<void> {
  try {
    if (redis.status !== "end" && redis.status !== "close") {
      await redis.quit();
      logger.info("Redis connection closed cleanly.");
    }
  } catch (err) {
    logger.error({ err }, "Error closing Redis connection");
  }
}
