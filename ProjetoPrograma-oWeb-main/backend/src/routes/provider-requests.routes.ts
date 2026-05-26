import { Router } from "express";
import { ProviderRequestsController } from "../controllers/provider-requests.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const providerRequestsRoutes = Router();
const controller = new ProviderRequestsController();

providerRequestsRoutes.post(
  "/",
  authMiddleware,
  requireRole(["cliente", "prestador_pendente"]),
  controller.create
);

providerRequestsRoutes.get(
  "/",
  authMiddleware,
  requireRole(["admin"]),
  controller.findAll
);

providerRequestsRoutes.patch(
  "/:id/approve",
  authMiddleware,
  requireRole(["admin"]),
  controller.approve
);

providerRequestsRoutes.patch(
  "/:id/reject",
  authMiddleware,
  requireRole(["admin"]),
  controller.reject
);

export { providerRequestsRoutes };