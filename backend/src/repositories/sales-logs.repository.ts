import { db } from "../db";
import { salesLogs, services, users } from "../db/schema";
import { desc, eq } from "drizzle-orm";

const clientAlias = db.select().from(users).as("client");
const providerAlias = db.select().from(users).as("provider");

export class SalesLogsRepository {
  async create(data: {
    appointmentId?: number;
    serviceId?: number;
    clientId: number;
    providerId: number;
    amount: number;
    paymentMethod: string;
    status?: string;
  }) {
    const result = await db
      .insert(salesLogs)
      .values({
        appointmentId: data.appointmentId ?? null,
        serviceId: data.serviceId ?? null,
        clientId: data.clientId,
        providerId: data.providerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        status: data.status ?? "pendente"
      })
      .returning();

    return result[0];
  }

  async findAll() {
    const allLogs = await db
      .select()
      .from(salesLogs)
      .orderBy(desc(salesLogs.createdAt));

    const clientIds = [...new Set(allLogs.map(l => l.clientId))];
    const providerIds = [...new Set(allLogs.map(l => l.providerId))];
    const allUsers = await db
      .select()
      .from(users)
      .where(
        eq(users.id, -1) // placeholder - we'll map manually
      );

    // Fetch all relevant users
    const relevantIds = [...new Set([...clientIds, ...providerIds])];
    const userData = await Promise.all(
      relevantIds.map(id =>
        db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, id))
      )
    );
    const userMap = new Map(userData.flat().map(u => [u.id, u.name]));

    return allLogs.map(log => ({
      ...log,
      clientName: userMap.get(log.clientId) ?? "Desconhecido",
      providerName: userMap.get(log.providerId) ?? "Desconhecido"
    }));
  }

  async getStats() {
    const allLogs = await db.select().from(salesLogs);
    const totalRevenue = allLogs.reduce((sum, l) => sum + l.amount, 0);
    const completedCount = allLogs.filter(l => l.status === "confirmado").length;
    const pendingCount = allLogs.filter(l => l.status === "pendente").length;

    return {
      totalRevenue,
      totalSales: allLogs.length,
      completedCount,
      pendingCount
    };
  }

  async getRecent(limit = 10) {
    const logs = await db.select().from(salesLogs).orderBy(desc(salesLogs.createdAt)).limit(limit);
    const clientIds = [...new Set(logs.map(l => l.clientId))];
    const userData = await Promise.all(
      clientIds.map(id =>
        db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, id))
      )
    );
    const userMap = new Map(userData.flat().map(u => [u.id, u.name]));

    return logs.map(log => ({
      ...log,
      clientName: userMap.get(log.clientId) ?? "Desconhecido"
    }));
  }
}
