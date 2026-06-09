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

paymentsRoutes.get(
  "/checkout-session/:sessionId",
  authMiddleware,
  controller.getCheckoutSession
);

export { paymentsRoutes };