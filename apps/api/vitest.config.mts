import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"],
    environment: "node",
    globalSetup: ["src/test/globalSetup.ts"],
    env: {
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/whatsapp_orders_test?schema=public",
      NODE_ENV: "test",
    },
  },
});
