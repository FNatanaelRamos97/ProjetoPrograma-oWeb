import { Router } from "express";
import { AppointmentsController } from "../controllers/appointments.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const appointmentsRoutes = Router();
const controller = new AppointmentsController();

appointmentsRoutes.get(
  "/providers/:providerId/availability",
  controller.availability,
);

appointmentsRoutes.post(
  "/",
  authMiddleware,
  requireRole(["cliente", "admin"]),
  controller.create,
);

appointmentsRoutes.get(
  "/",
  authMiddleware,
  requireRole(["admin"]),
  controller.findAll,
);

appointmentsRoutes.get("/my", authMiddleware, controller.listMyAppointments);

appointmentsRoutes.get(
  "/provider/my",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  controller.listMyProviderAppointments,
);

appointmentsRoutes.patch("/:id/confirm", authMiddleware, controller.confirm);

appointmentsRoutes.patch("/:id/cancel", authMiddleware, controller.cancel);

export { appointmentsRoutes };
