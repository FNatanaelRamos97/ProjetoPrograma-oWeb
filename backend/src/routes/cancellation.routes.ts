import { Router } from "express";
import { CancellationController } from "../controllers/cancellation.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const cancellationRoutes = Router();
const controller = new CancellationController();

cancellationRoutes.post(
  "/",
  authMiddleware,
  requireRole(["cliente", "admin"]),
  controller.create,
);

cancellationRoutes.get(
  "/my",
  authMiddleware,
  controller.listMy,
);

cancellationRoutes.get(
  "/admin",
  authMiddleware,
  requireRole(["admin"]),
  controller.listAll,
);

cancellationRoutes.patch(
  "/:id/approve",
  authMiddleware,
  requireRole(["admin"]),
  controller.approve,
);

cancellationRoutes.patch(
  "/:id/reject",
  authMiddleware,
  requireRole(["admin"]),
  controller.reject,
);

export { cancellationRoutes };
