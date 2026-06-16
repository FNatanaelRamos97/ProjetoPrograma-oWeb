import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { providerRequests, users } from "../db/schema";

export class ProviderRequestsRepository {
  async create(userId: number, message: string) {
    const existing = await db
      .select()
      .from(providerRequests)
      .where(
        and(
          eq(providerRequests.userId, userId),
          eq(providerRequests.status, "pendente")
        )
      );

    if (existing[0]) {
      return existing[0];
    }

    const result = await db
      .insert(providerRequests)
      .values({
        userId,
        message,
        status: "pendente"
      })
      .returning();

    return result[0];
  }

  async findAll() {
    return db
      .select({
        id: providerRequests.id,
        userId: providerRequests.userId,
        userName: users.name,
        userEmail: users.email,
        status: providerRequests.status,
        message: providerRequests.message,
        createdAt: providerRequests.createdAt
      })
      .from(providerRequests)
      .innerJoin(users, eq(users.id, providerRequests.userId));
  }

  async findById(id: number) {
    const result = await db
      .select()
      .from(providerRequests)
      .where(eq(providerRequests.id, id));

    return result[0] ?? null;
  }

  async updateStatus(id: number, status: "aprovado" | "recusado") {
    const result = await db
      .update(providerRequests)
      .set({ status })
      .where(eq(providerRequests.id, id))
      .returning();

    return result[0] ?? null;
  }
}