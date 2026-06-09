import { Router } from "express";
import { ProviderUnavailableDatesController } from "../controllers/provider-unavailable-dates.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const providerUnavailableDatesRoutes = Router();
const controller = new ProviderUnavailableDatesController();

providerUnavailableDatesRoutes.get(
  "/me",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  controller.findMyUnavailableDates
);

providerUnavailableDatesRoutes.post(
  "/toggle",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  controller.toggleUnavailableDate
);

providerUnavailableDatesRoutes.get(
  "/provider/:providerId",
  controller.findByProvider
);

export { providerUnavailableDatesRoutes };