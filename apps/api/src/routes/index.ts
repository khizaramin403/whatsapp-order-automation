import { Router } from "express";

export const apiV1Router = Router();

apiV1Router.get("/", (_req, res) => {
  res.status(200).json({
    data: {
      name: "WhatsApp Order Automation API",
      version: "v1",
      status: "active",
    },
  });
});

export default apiV1Router;
