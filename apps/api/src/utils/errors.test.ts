import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import app from "../app";
import { AppError, ErrorCode } from "./errors";
import { errorHandler } from "../middleware/errorHandler";
import { sendSuccess } from "./response";

describe("Response and Error Format", () => {
  it("formats success responses with data and meta", () => {
    const testApp = express();
    testApp.get("/test-success", (_req, res) => {
      return sendSuccess(res, { item: "burger" }, { page: 1, pageSize: 20, total: 50 }, 200);
    });

    return request(testApp)
      .get("/test-success")
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          data: { item: "burger" },
          meta: { page: 1, pageSize: 20, total: 50 },
        });
      });
  });

  it("formats AppError with statusCode, code, message and requestId", async () => {
    const testApp = express();
    testApp.get("/test-app-error", () => {
      throw new AppError("Cannot move DELIVERED to PREPARING", 400, ErrorCode.ORDER_INVALID_TRANSITION);
    });
    testApp.use(errorHandler);

    const res = await request(testApp)
      .get("/test-app-error")
      .set("x-request-id", "req-12345")
      .expect(400);

    expect(res.body).toEqual({
      error: {
        code: "ORDER_INVALID_TRANSITION",
        message: "Cannot move DELIVERED to PREPARING",
        requestId: "req-12345",
      },
    });
  });

  it("includes details in error response when provided", async () => {
    const testApp = express();
    testApp.get("/test-details-error", () => {
      throw new AppError("Validation failed", 400, ErrorCode.VALIDATION_ERROR, [
        { field: "email", message: "Invalid email" },
      ]);
    });
    testApp.use(errorHandler);

    const res = await request(testApp)
      .get("/test-details-error")
      .set("x-request-id", "req-validation-1")
      .expect(400);

    expect(res.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        requestId: "req-validation-1",
        details: [{ field: "email", message: "Invalid email" }],
      },
    });
  });

  it("handles unknown internal errors without leaking stack traces", async () => {
    const testApp = express();
    testApp.get("/test-crash", () => {
      throw new Error("Secret database password / connection failed inside internal stack");
    });
    testApp.use(errorHandler);

    const res = await request(testApp)
      .get("/test-crash")
      .set("x-request-id", "req-crash-99")
      .expect(500);

    expect(res.body).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        requestId: "req-crash-99",
      },
    });
    // Ensure stack trace was not leaked to response body
    expect(res.body.stack).toBeUndefined();
    expect(res.text).not.toContain("Secret database password");
  });

  it("returns 404 NOT_FOUND for unknown routes in main app", async () => {
    const res = await request(app)
      .get("/api/v1/non-existent-endpoint-test")
      .set("x-request-id", "req-404")
      .expect(404);

    expect(res.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
        requestId: "req-404",
      },
    });
  });

  it("serves GET /health outside /api/v1", async () => {
    const res = await request(app).get("/health").expect(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("serves GET /api/v1 base route", async () => {
    const res = await request(app).get("/api/v1").expect(200);
    expect(res.body.data.version).toBe("v1");
  });
});
