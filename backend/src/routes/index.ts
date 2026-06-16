import { Router } from "express";
import { adminRoutes } from "./admin.routes";
import { appointmentsRoutes } from "./appointments.routes";
import { authRoutes } from "./auth.routes";
import { providerRequestsRoutes } from "./provider-requests.routes";
import { reviewsRoutes } from "./reviews.routes";
import { salesLogsRoutes } from "./sales-logs.routes";
import { servicesRoutes } from "./services.routes";
import { usersRoutes } from "./users.routes";
import { paymentsRoutes } from "./payments.routes";
import { walletRoutes } from "./wallet.routes";
import { providerUnavailableDatesRoutes } from "./provider-unavailable-dates.routes";
import { providerAvailabilityRoutes } from "./provider-availability.routes";
import { cancellationRoutes } from "./cancellation.routes";

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
routes.use("/reviews", reviewsRoutes);
routes.use("/sales-logs", salesLogsRoutes);
routes.use("/appointments", appointmentsRoutes);
routes.use("/wallet", walletRoutes);
routes.use("/admin", adminRoutes);
routes.use("/provider-unavailable-dates", providerUnavailableDatesRoutes);
routes.use("/provider-availability", providerAvailabilityRoutes);
routes.use("/payments", paymentsRoutes);
routes.use("/cancellation-requests", cancellationRoutes);


export { routes };