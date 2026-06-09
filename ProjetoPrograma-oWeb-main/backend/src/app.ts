import express from "express";
import cors from "cors";
import path from "path";
import { routes } from "./routes";
import { paymentsWebhookRoutes } from "./routes/payments-webhook.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors());

app.use(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentsWebhookRoutes
);

app.use(express.json());

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

app.use(routes);

app.use(errorMiddleware);

export { app };