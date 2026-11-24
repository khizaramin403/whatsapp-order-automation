import { Router } from "express";
import { authRouter } from "./auth.routes";
import { orderRouter } from "./order.routes";
import { menuRouter } from "./menu.routes";
import { teamRouter } from "./team.routes";
import { settingsRouter } from "./settings.routes";
import { analyticsRouter } from "./analytics.routes";

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

// Menu routes (/api/v1/menu)
apiV1Router.use("/menu", menuRouter);

// Team routes (/api/v1/team)
apiV1Router.use("/team", teamRouter);

// Settings routes (/api/v1/settings)
apiV1Router.use("/settings", settingsRouter);

// Analytics routes (/api/v1/analytics)
apiV1Router.use("/analytics", analyticsRouter);

export default apiV1Router;
