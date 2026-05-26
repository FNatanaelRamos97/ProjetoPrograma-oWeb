import { Router } from "express";
import { adminRoutes } from "./admin.routes";
import { appointmentsRoutes } from "./appointments.routes";
import { authRoutes } from "./auth.routes";
import { providerRequestsRoutes } from "./provider-requests.routes";
import { servicesRoutes } from "./services.routes";
import { usersRoutes } from "./users.routes";

const routes = Router();

routes.get("/health", (request, response) => {
  return response.json({
    status: "ok",
    message: "API funcionando"
  });
});

routes.use("/auth", authRoutes);
routes.use("/users", usersRoutes);
routes.use("/services", servicesRoutes);
routes.use("/provider-requests", providerRequestsRoutes);
routes.use("/appointments", appointmentsRoutes);
routes.use("/admin", adminRoutes);

export { routes };