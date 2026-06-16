import { Router } from "express";
import { ReviewsController } from "../controllers/reviews.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const reviewsRoutes = Router();
const controller = new ReviewsController();

reviewsRoutes.post("/", authMiddleware, controller.create);
reviewsRoutes.get(
  "/admin",
  authMiddleware,
  requireRole(["admin"]),
  controller.findAllAdmin,
);
reviewsRoutes.get("/service/:serviceId", controller.findByService);
reviewsRoutes.get("/provider/:providerId", controller.findByProvider);

export { reviewsRoutes };
