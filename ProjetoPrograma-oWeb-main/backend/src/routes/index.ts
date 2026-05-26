import { Router } from "express";
import { authRoutes } from "./auth.routes";
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

export { routes };