import { Router } from "express";
import { ProviderAvailabilityController } from "../controllers/provider-availability.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const providerAvailabilityRoutes = Router();
const controller = new ProviderAvailabilityController();

providerAvailabilityRoutes.get(
  "/me",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  controller.getWeeklySchedule,
);

providerAvailabilityRoutes.put(
  "/me",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  controller.updateWeeklySchedule,
);

providerAvailabilityRoutes.get(
  "/overrides",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  controller.getOverrides,
);

providerAvailabilityRoutes.post(
  "/overrides",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  controller.saveOverride,
);

providerAvailabilityRoutes.delete(
  "/overrides/:id",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  controller.deleteOverride,
);

providerAvailabilityRoutes.get(
  "/blocked-slots",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  controller.getBlockedSlots,
);

providerAvailabilityRoutes.post(
  "/blocked-slots",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  controller.blockSlot,
);

providerAvailabilityRoutes.delete(
  "/blocked-slots/:id",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  controller.unblockSlot,
);

export { providerAvailabilityRoutes };
