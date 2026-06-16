import { count, eq } from "drizzle-orm";
import { db } from "../db";
import { appointments, providerRequests, services, users } from "../db/schema";

export class AdminRepository {
  async dashboard() {
    const totalUsers = await db.select({ total: count() }).from(users);
    const totalClients = await db
      .select({ total: count() })
      .from(users)
      .where(eq(users.role, "cliente"));

    const totalProviders = await db
      .select({ total: count() })
      .from(users)
      .where(eq(users.role, "prestador"));

    const totalServices = await db.select({ total: count() }).from(services);
    const totalAppointments = await db.select({ total: count() }).from(appointments);

    const pendingProviderRequests = await db
      .select({ total: count() })
      .from(providerRequests)
      .where(eq(providerRequests.status, "pendente"));

    return {
      totalUsers: totalUsers[0].total,
      totalClients: totalClients[0].total,
      totalProviders: totalProviders[0].total,
      totalServices: totalServices[0].total,
      totalAppointments: totalAppointments[0].total,
      pendingProviderRequests: pendingProviderRequests[0].total
    };
  }
}