import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "./env";
import { logger } from "../utils/logger";

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export async function closePrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    await pool.end();
    logger.info("Prisma Client and PostgreSQL connection pool closed cleanly.");
  } catch (err) {
    logger.error({ err }, "Error closing Prisma/PostgreSQL connections");
  }
}
