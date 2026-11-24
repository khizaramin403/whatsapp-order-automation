import pg from "pg";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export default async function globalSetup() {
  const adminUrl = "postgresql://postgres:postgres@localhost:5432/postgres";
  const testDbName = "whatsapp_orders_test";
  const testDbUrl = `postgresql://postgres:postgres@localhost:5432/${testDbName}?schema=public`;

  // 1. Ensure test database exists on Docker Postgres
  const adminClient = new pg.Client({ connectionString: adminUrl });
  try {
    await adminClient.connect();
    const res = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [testDbName]
    );

    if (res.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE ${testDbName}`);
      console.log(`[Test Setup] Created isolated database: ${testDbName}`);
    }
  } finally {
    await adminClient.end();
  }

  // 2. Connect to test database and check if tables exist
  const testClient = new pg.Client({ connectionString: testDbUrl });
  try {
    await testClient.connect();
    const tableCheck = await testClient.query(
      "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'restaurants'"
    );

    if (tableCheck.rowCount === 0) {
      console.log(`[Test Setup] Applying migrations to ${testDbName}...`);
      const apiDir = path.resolve(__dirname, "../..");
      const m1Path = path.resolve(apiDir, "prisma/migrations/20261113204250_init/migration.sql");
      const m2Path = path.resolve(
        apiDir,
        "prisma/migrations/20261124105900_complete_phase3_schema/migration.sql"
      );

      const m1Sql = fs.readFileSync(m1Path, "utf-8");
      const m2Sql = fs.readFileSync(m2Path, "utf-8");

      await testClient.query(m1Sql);
      await testClient.query(m2Sql);

      console.log(`[Test Setup] Migrations applied. Seeding base demo data into ${testDbName}...`);
      execSync("pnpm exec tsx prisma/seed.ts", {
        cwd: apiDir,
        env: {
          ...process.env,
          DATABASE_URL: testDbUrl,
          NODE_ENV: "test",
        },
        stdio: "ignore",
      });
      console.log(`[Test Setup] Test database initialized and ready.`);
    }

    // 3. Ensure Multi-tenant fixtures for Hotel A & Hotel B exist
    const fixtureCheck = await testClient.query(
      "SELECT 1 FROM restaurants WHERE id = $1",
      ["11111111-1111-4000-8000-000000000001"]
    );

    if (fixtureCheck.rowCount === 0) {
      console.log(`[Test Setup] Seeding Multi-tenant test fixtures (Hotel A & Hotel B)...`);
      // Run multi-tenant fixture setup
      process.env.DATABASE_URL = testDbUrl;
      const { setupMultiTenantFixture } = await import("./multiTenantFixture");
      await setupMultiTenantFixture();
    }
  } finally {
    await testClient.end();
  }

  // Return teardown function executed after all test files finish
  return async () => {
    try {
      process.env.DATABASE_URL = testDbUrl;
      const { teardownMultiTenantFixture } = await import("./multiTenantFixture");
      const { closePrisma } = await import("../config/prisma");
      await teardownMultiTenantFixture();
      await closePrisma();
    } catch {
      // Ignore cleanup error on shutdown
    }
  };
}
