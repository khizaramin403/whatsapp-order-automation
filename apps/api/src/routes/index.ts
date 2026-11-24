import { Router } from "express";
import { authRouter } from "./auth.routes";
import { orderRouter } from "./order.routes";

export const apiV1Router = Router();

// Base info
apiV1Router.get("/", (_req, res) => {
  res.status(200).json({
    data: {
      name: "WhatsApp Order Automation API",
      version: "v1",
      status: "active",
    },
  });
});

// Authentication routes (/api/v1/auth)
apiV1Router.use("/auth", authRouter);

// Orders routes (/api/v1/orders)
apiV1Router.use("/orders", orderRouter);

export default apiV1Router;
