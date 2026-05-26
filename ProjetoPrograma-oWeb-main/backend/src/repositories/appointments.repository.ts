import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { appointments, providerAvailability, services, users } from "../db/schema";

export class AppointmentsRepository {
  async findAvailability(providerId: number, year: number, month: number) {
    const availability = await db
      .select()
      .from(providerAvailability)
      .where(eq(providerAvailability.providerId, providerId));

    const booked = await db
      .select()
      .from(appointments)
      .where(eq(appointments.providerId, providerId));

    const daysInMonth = new Date(year, month, 0).getDate();

    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();

      const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const hasAvailability = availability.some((item) => item.dayOfWeek === dayOfWeek);

      const isBooked = booked.some(
        (item) =>
          item.appointmentDate === dateString &&
          item.status !== "cancelado"
      );

      result.push({
        date: dateString,
        day,
        available: hasAvailability && !isBooked
      });
    }

    return result;
  }

  async create(data: {
    serviceId: number;
    providerId: number;
    clientId: number;
    appointmentDate: string;
  }) {
    const existing = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.providerId, data.providerId),
          eq(appointments.appointmentDate, data.appointmentDate)
        )
      );

    const unavailable = existing.some((item) => item.status !== "cancelado");

    if (unavailable) {
      return null;
    }

    const result = await db
      .insert(appointments)
      .values({
        serviceId: data.serviceId,
        providerId: data.providerId,
        clientId: data.clientId,
        appointmentDate: data.appointmentDate,
        status: "pendente"
      })
      .returning();

    return result[0];
  }

  async findAll() {
    return db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
        serviceName: services.name,
        providerName: users.name,
        clientId: appointments.clientId,
        createdAt: appointments.createdAt
      })
      .from(appointments)
      .innerJoin(services, eq(services.id, appointments.serviceId))
      .innerJoin(users, eq(users.id, appointments.providerId));
  }
}