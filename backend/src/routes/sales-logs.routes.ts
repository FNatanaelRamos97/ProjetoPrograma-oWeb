import { Router } from "express";
import { SalesLogsController } from "../controllers/sales-logs.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const salesLogsRoutes = Router();
const controller = new SalesLogsController();

salesLogsRoutes.get("/", authMiddleware, requireRole(["admin"]), controller.list);
salesLogsRoutes.get("/stats", authMiddleware, requireRole(["admin"]), controller.stats);
salesLogsRoutes.get("/recent", authMiddleware, requireRole(["admin"]), controller.recent);

export { salesLogsRoutes };
