import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { z } from "zod";
import { validate } from "./validate";
import { errorHandler } from "./errorHandler";

describe("Zod Validation Middleware", () => {
  const schema = {
    body: z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      price: z.number().int().positive("Price must be a positive integer"),
    }),
    query: z.object({
      status: z.enum(["active", "inactive"]).optional(),
    }),
    params: z.object({
      id: z.string().uuid("ID must be a valid UUID"),
    }),
  };

  const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.post("/items/:id", validate(schema), (req, res) => {
      res.status(200).json({
        data: {
          params: req.params,
          query: req.query,
          body: req.body,
        },
      });
    });
    app.use(errorHandler);
    return app;
  };

  it("passes valid requests through and coerces/parses fields correctly", async () => {
    const app = createTestApp();
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";

    const res = await request(app)
      .post(`/items/${validUuid}?status=active`)
      .send({ name: "Biryani", price: 58000 })
      .expect(200);

    expect(res.body.data.params.id).toBe(validUuid);
    expect(res.body.data.query.status).toBe("active");
    expect(res.body.data.body).toEqual({ name: "Biryani", price: 58000 });
  });

  it("returns 400 VALIDATION_ERROR with field details on invalid body", async () => {
    const app = createTestApp();
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";

    const res = await request(app)
      .post(`/items/${validUuid}`)
      .send({ name: "A", price: -10 })
      .expect(400);

    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toBe("Validation failed");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name", message: "Name must be at least 2 characters" }),
        expect.objectContaining({ field: "price", message: "Price must be a positive integer" }),
      ])
    );
  });

  it("returns 400 VALIDATION_ERROR on invalid route params", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/items/not-a-uuid")
      .send({ name: "Kabab", price: 62000 })
      .expect(400);

    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "id", message: "ID must be a valid UUID" }),
      ])
    );
  });

  it("returns 400 VALIDATION_ERROR on invalid query params", async () => {
    const app = createTestApp();
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";

    const res = await request(app)
      .post(`/items/${validUuid}?status=unknown_status`)
      .send({ name: "Kheer", price: 25000 })
      .expect(400);

    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details[0].field).toBe("status");
  });
});
