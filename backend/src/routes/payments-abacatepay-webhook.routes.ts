import { Router } from "express";
import { PaymentsController } from "../controllers/payments.controller";

const paymentsAbacatePayWebhookRoutes = Router();
const controller = new PaymentsController();

paymentsAbacatePayWebhookRoutes.post("/", controller.abacatepayWebhook);

export { paymentsAbacatePayWebhookRoutes };
