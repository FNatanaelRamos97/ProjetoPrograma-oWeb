import { Router } from "express";
import { PaymentsController } from "../controllers/payments.controller";

const paymentsMercadoPagoWebhookRoutes = Router();
const controller = new PaymentsController();

paymentsMercadoPagoWebhookRoutes.post("/", controller.mercadopagoWebhook);

export { paymentsMercadoPagoWebhookRoutes };
