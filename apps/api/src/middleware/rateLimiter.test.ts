import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { createLimiter } from "./rateLimiter";
import { errorHandler } from "./errorHandler";

describe("Rate Limiter Middleware", () => {
  it("allows requests under the limit and sets rate limit headers", async () => {
    const app = express();
    const limiter = createLimiter({
      windowMs: 60 * 1000,
      max: 3,
      useMemoryStore: true,
    });

    app.get("/test-limit", limiter, (_req, res) => {
      res.status(200).json({ ok: true });
    });
    app.use(errorHandler);

    // First request should pass
    const res1 = await request(app).get("/test-limit").expect(200);
    expect(res1.body.ok).toBe(true);
    expect(res1.headers["ratelimit-limit"]).toBe("3");
    expect(res1.headers["ratelimit-remaining"]).toBe("2");
  });

  it("blocks requests that exceed the limit, returns RATE_LIMITED code and Retry-After header", async () => {
    const app = express();
    const limiter = createLimiter({
      windowMs: 60 * 1000,
      max: 2,
      useMemoryStore: true,
    });

    app.get("/test-limit-exceed", limiter, (_req, res) => {
      res.status(200).json({ ok: true });
    });
    app.use(errorHandler);

    // Request 1: OK
    await request(app).get("/test-limit-exceed").expect(200);
    // Request 2: OK
    await request(app).get("/test-limit-exceed").expect(200);

    // Request 3: Blocked (429)
    const res3 = await request(app)
      .get("/test-limit-exceed")
      .set("x-request-id", "rl-test-req")
      .expect(429);

    expect(res3.headers["retry-after"]).toBeDefined();
    expect(Number(res3.headers["retry-after"])).toBeGreaterThan(0);
    expect(res3.body).toEqual({
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests, please try again later",
        requestId: "rl-test-req",
      },
    });
  });

  it("keys login attempts by IP + email", async () => {
    const app = express();
    app.use(express.json());

    const loginLimiterTest = createLimiter({
      windowMs: 60 * 1000,
      max: 1,
      useMemoryStore: true,
      keyGenerator: (req) => {
        const ip = req.ip || "unknown";
        const email = (req.body?.email || "").toLowerCase().trim();
        return email ? `${ip}_${email}` : ip;
      },
    });

    app.post("/test-login", loginLimiterTest, (_req, res) => {
      res.status(200).json({ loggedIn: true });
    });
    app.use(errorHandler);

    // Attempt with user A: success
    await request(app).post("/test-login").send({ email: "userA@example.com" }).expect(200);

    // Second attempt with user A: rate limited
    await request(app).post("/test-login").send({ email: "userA@example.com" }).expect(429);

    // Attempt with user B from same IP: allowed (different key)
    await request(app).post("/test-login").send({ email: "userB@example.com" }).expect(200);
  });
});
