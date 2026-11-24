import app from "./app";
import { env, closePrisma, closeRedis } from "./config";
import { logger } from "./utils/logger";

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 API server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  logger.info(`Health check available at http://localhost:${env.PORT}/health`);
  logger.info(`API v1 root available at http://localhost:${env.PORT}/api/v1`);
});

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down server gracefully...`);

  server.close(async () => {
    logger.info("HTTP server closed.");
    await closePrisma();
    await closeRedis();
    logger.info("All connections closed. Exiting process.");
    process.exit(0);
  });

  // Force shutdown if cleanup hangs
  setTimeout(() => {
    logger.error("Graceful shutdown timed out. Forcing process exit.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
