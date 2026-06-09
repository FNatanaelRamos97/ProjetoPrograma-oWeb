import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { appointments, reviews, services, users } from "../db/schema";
import { sql } from "drizzle-orm";

export class ReviewsRepository {
  async create(data: {
    appointmentId: number;
    serviceId: number;
    clientId: number;
    providerId: number;
    rating: number;
    comment: string;
  }) {
    const appointment = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, data.appointmentId),
          eq(appointments.clientId, data.clientId),
          eq(appointments.serviceId, data.serviceId),
          eq(appointments.providerId, data.providerId),
          eq(appointments.status, "concluido"),
        ),
      );

    if (!appointment[0]) return null;

    const existing = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.appointmentId, data.appointmentId),
          eq(reviews.clientId, data.clientId),
        ),
      );

    if (existing[0]) return null;

    const result = await db.insert(reviews).values(data).returning();
    return result[0];
  }

  async findByService(serviceId: number) {
    return db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        clientName: users.name,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .innerJoin(users, eq(users.id, reviews.clientId))
      .where(eq(reviews.serviceId, serviceId))
      .orderBy(reviews.id);
  }

  async findByProvider(providerId: number) {
    return db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        clientName: users.name,
        serviceName: services.name,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .innerJoin(users, eq(users.id, reviews.clientId))
      .innerJoin(services, eq(services.id, reviews.serviceId))
      .where(eq(reviews.providerId, providerId))
      .orderBy(reviews.id);
  }

  async getAverageRating(serviceId: number) {
    const result = await db
      .select({
        avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        count: sql<number>`COUNT(${reviews.id})`,
      })
      .from(reviews)
      .where(eq(reviews.serviceId, serviceId));

    return {
      avg: Number(result[0]?.avg ?? 0),
      count: Number(result[0]?.count ?? 0),
    };
  }

  async findAllAdmin() {
    const rows = await db
      .select({
        id: reviews.id,
        appointmentId: reviews.appointmentId,
        serviceId: reviews.serviceId,
        serviceName: services.name,
        clientId: reviews.clientId,
        clientName: users.name,
        providerId: reviews.providerId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .innerJoin(services, eq(services.id, reviews.serviceId))
      .innerJoin(users, eq(users.id, reviews.clientId))
      .orderBy(reviews.createdAt);

    return rows;
  }
}
