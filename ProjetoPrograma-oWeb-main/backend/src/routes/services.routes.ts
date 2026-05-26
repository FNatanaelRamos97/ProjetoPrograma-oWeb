import { Router } from "express";
import { ServicesController } from "../controllers/services.controller";

const servicesRoutes = Router();
const servicesController = new ServicesController();

servicesRoutes.post("/", servicesController.create);
servicesRoutes.get("/", servicesController.findAll);
servicesRoutes.get("/provider/:providerId", servicesController.findByProvider);
servicesRoutes.get("/:id", servicesController.findById);
servicesRoutes.put("/:id", servicesController.update);
servicesRoutes.delete("/:id", servicesController.delete);

export { servicesRoutes };