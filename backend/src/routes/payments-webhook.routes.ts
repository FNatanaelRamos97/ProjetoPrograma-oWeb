import { Router } from "express";
import { PaymentsController } from "../controllers/payments.controller";

const paymentsWebhookRoutes = Router();
const controller = new PaymentsController();

paymentsWebhookRoutes.post("/", controller.webhook);

export { paymentsWebhookRoutes };