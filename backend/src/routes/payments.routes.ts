import { Router } from "express";
import { PaymentsController } from "../controllers/payments.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const paymentsRoutes = Router();
const controller = new PaymentsController();

paymentsRoutes.post(
  "/checkout-session",
  authMiddleware,
  controller.createCheckoutSession
);

paymentsRoutes.post(
  "/mercadopago/checkout-session",
  authMiddleware,
  controller.createMercadoPagoCheckoutSession
);

paymentsRoutes.post(
  "/abacatepay/checkout-session",
  authMiddleware,
  controller.createAbacatePayCheckoutSession
);

paymentsRoutes.get(
  "/checkout-session/:sessionId",
  authMiddleware,
  controller.getCheckoutSession
);

export { paymentsRoutes };
