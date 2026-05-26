import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const adminRoutes = Router();
const controller = new AdminController();

adminRoutes.use(authMiddleware);
adminRoutes.use(requireRole(["admin"]));

adminRoutes.get("/dashboard", controller.dashboard);
adminRoutes.get("/users", controller.users);
adminRoutes.get("/services", controller.services);
adminRoutes.get("/appointments", controller.appointments);

export { adminRoutes };