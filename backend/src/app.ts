import express from "express";
import cors from "cors";
import path from "path";
import { routes } from "./routes";
import { paymentsWebhookRoutes } from "./routes/payments-webhook.routes";
import { paymentsMercadoPagoWebhookRoutes } from "./routes/payments-mercadopago-webhook.routes";
import { paymentsAbacatePayWebhookRoutes } from "./routes/payments-abacatepay-webhook.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors());

app.use(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentsWebhookRoutes
);

app.use(
  "/payments/mercadopago/webhook",
  express.raw({ type: "application/json" }),
  paymentsMercadoPagoWebhookRoutes
);

app.use(
  "/payments/abacatepay/webhook",
  express.raw({ type: "application/json" }),
  paymentsAbacatePayWebhookRoutes
);

app.use(express.json());

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

app.use(routes);

const frontendDistPath = path.resolve(__dirname, "..", "..", "frontend", "dist");
app.use(express.static(frontendDistPath));
app.use((req, res) => {
  if (req.method === "GET") {
    res.sendFile(path.resolve(frontendDistPath, "index.html"));
  } else {
    res.status(404).json({ message: "Rota não encontrada" });
  }
});

app.use(errorMiddleware);

export { app };
