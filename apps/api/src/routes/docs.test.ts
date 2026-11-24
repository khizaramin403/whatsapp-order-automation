import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";
import { openapiDocument } from "../docs/openapi";

describe("OpenAPI Documentation (/api/docs)", () => {
  it("serves the raw OpenAPI 3.0 JSON specification at /api/docs/openapi.json", async () => {
    const res = await request(app).get("/api/docs/openapi.json");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.info.title).toBe("WhatsApp Order Automation API");
    expect(res.body.info.version).toBe("1.0.0");
  });

  it("documents authentication security schemes (BearerAuth and RefreshCookie)", async () => {
    const res = await request(app).get("/api/docs/openapi.json");

    expect(res.status).toBe(200);
    const securitySchemes = res.body.components.securitySchemes;
    expect(securitySchemes).toBeDefined();

    // BearerAuth JWT
    expect(securitySchemes.BearerAuth).toEqual({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: expect.stringContaining("JWT access token"),
    });

    // RefreshCookie httpOnly cookie
    expect(securitySchemes.RefreshCookie).toEqual({
      type: "apiKey",
      in: "cookie",
      name: "refreshToken",
      description: expect.stringContaining("httpOnly"),
    });
  });

  it("documents all /api/v1 endpoints built across Phase 3", async () => {
    const res = await request(app).get("/api/docs/openapi.json");

    expect(res.status).toBe(200);
    const paths = res.body.paths;
    expect(paths).toBeDefined();

    // Auth
    expect(paths["/api/v1/auth/login"]).toHaveProperty("post");
    expect(paths["/api/v1/auth/refresh"]).toHaveProperty("post");
    expect(paths["/api/v1/auth/logout"]).toHaveProperty("post");
    expect(paths["/api/v1/auth/me"]).toHaveProperty("get");
    expect(paths["/api/v1/auth/me"]).toHaveProperty("patch");

    // Orders
    expect(paths["/api/v1/orders"]).toHaveProperty("get");
    expect(paths["/api/v1/orders/{id}"]).toHaveProperty("get");
    expect(paths["/api/v1/orders/{id}/status"]).toHaveProperty("patch");
    expect(paths["/api/v1/orders/{id}/payment"]).toHaveProperty("patch");

    // Menu Categories & Items
    expect(paths["/api/v1/menu/categories"]).toHaveProperty("get");
    expect(paths["/api/v1/menu/categories"]).toHaveProperty("post");
    expect(paths["/api/v1/menu/categories/reorder"]).toHaveProperty("patch");
    expect(paths["/api/v1/menu/categories/{id}"]).toHaveProperty("patch");
    expect(paths["/api/v1/menu/categories/{id}"]).toHaveProperty("delete");
    expect(paths["/api/v1/menu/items"]).toHaveProperty("get");
    expect(paths["/api/v1/menu/items"]).toHaveProperty("post");
    expect(paths["/api/v1/menu/items/{id}"]).toHaveProperty("patch");
    expect(paths["/api/v1/menu/items/{id}"]).toHaveProperty("delete");
    expect(paths["/api/v1/menu/items/{id}/availability"]).toHaveProperty("patch");

    // Team
    expect(paths["/api/v1/team"]).toHaveProperty("get");
    expect(paths["/api/v1/team"]).toHaveProperty("post");
    expect(paths["/api/v1/team/{id}"]).toHaveProperty("patch");
    expect(paths["/api/v1/team/{id}"]).toHaveProperty("delete");

    // Settings
    expect(paths["/api/v1/settings"]).toHaveProperty("get");
    expect(paths["/api/v1/settings"]).toHaveProperty("patch");

    // Analytics
    expect(paths["/api/v1/analytics/summary"]).toHaveProperty("get");
  });

  it("serves the interactive Swagger UI at /api/docs", async () => {
    // swagger-ui-express usually redirects /api/docs to /api/docs/ or renders HTML
    const res = await request(app).get("/api/docs/");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/html/);
    expect(res.text).toContain("swagger-ui");
  });

  it("includes schemas derived from Zod validation schemas", () => {
    const schemas = openapiDocument.components.schemas;
    expect(schemas).toBeDefined();

    // Auth schemas
    expect(schemas.LoginRequest).toBeDefined();
    expect(schemas.LanguageRequest).toBeDefined();

    // Order schemas
    expect(schemas.UpdateOrderStatusRequest).toBeDefined();
    expect(schemas.UpdatePaymentStatusRequest).toBeDefined();

    // Menu schemas
    expect(schemas.CreateCategoryRequest).toBeDefined();
    expect(schemas.UpdateCategoryRequest).toBeDefined();
    expect(schemas.ReorderCategoriesRequest).toBeDefined();
    expect(schemas.CreateMenuItemRequest).toBeDefined();
    expect(schemas.UpdateMenuItemRequest).toBeDefined();
    expect(schemas.UpdateAvailabilityRequest).toBeDefined();

    // Team schemas
    expect(schemas.CreateTeamMemberRequest).toBeDefined();
    expect(schemas.UpdateTeamMemberRequest).toBeDefined();

    // Settings schema
    expect(schemas.UpdateSettingsRequest).toBeDefined();
  });
});
