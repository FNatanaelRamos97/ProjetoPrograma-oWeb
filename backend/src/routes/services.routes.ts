import { Router } from "express";
import { ServicesController } from "../controllers/services.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const servicesRoutes = Router();
const servicesController = new ServicesController();

servicesRoutes.post(
  "/",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  (request, response, next) => {
    const cp = upload.array("images", 3);
    cp(request, response, (err) => {
      if (err) return response.status(400).json({ message: err.message });
      next();
    });
  },
  servicesController.create
);

servicesRoutes.get("/", servicesController.findAll);
servicesRoutes.get("/provider/:providerId", servicesController.findByProvider);
servicesRoutes.get("/:id", servicesController.findById);

servicesRoutes.put(
  "/:id",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  servicesController.update
);

servicesRoutes.delete(
  "/:id",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  servicesController.delete
);

export { servicesRoutes };