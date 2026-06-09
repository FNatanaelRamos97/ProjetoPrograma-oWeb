import { and, eq, sql, like, ne } from "drizzle-orm";
import { db } from "../db";
import {
  appointments,
  providerAvailability,
  services,
  users,
  providerUnavailableDates,
} from "../db/schema";

function getDateString(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isWeekend(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  const weekDay = date.getDay();

  return weekDay === 0 || weekDay === 6;
}

export class AppointmentsRepository {
  async findAvailability(providerId: number, year: number, month: number) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;

    const unavailableDates = await db
      .select()
      .from(providerUnavailableDates)
      .where(
        and(
          eq(providerUnavailableDates.providerId, providerId),
          like(providerUnavailableDates.unavailableDate, `${monthPrefix}%`),
        ),
      );

    const providerAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.providerId, providerId),
          like(appointments.appointmentDate, `${monthPrefix}%`),
          ne(appointments.status, "cancelado"),
        ),
      );

    const unavailableSet = new Set(
      unavailableDates.map((item) => item.unavailableDate),
    );

    const appointmentsSet = new Set(
      providerAppointments.map((item) => item.appointmentDate),
    );

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = getDateString(year, month, day);

      const weekend = isWeekend(year, month, day);
      const blockedByProvider = unavailableSet.has(date);
      const alreadyBooked = appointmentsSet.has(date);

      return {
        date,
        available: !weekend && !blockedByProvider && !alreadyBooked,
        reason: weekend
          ? "Fim de semana"
          : blockedByProvider
            ? "Prestador indisponível"
            : alreadyBooked
              ? "Data já agendada"
              : null,
      };
    });
  }

  async create(data: {
    serviceId: number;
    providerId: number;
    clientId: number;
    appointmentDate: string;
  }) {
    const [year, month, day] = data.appointmentDate.split("-").map(Number);

    if (isWeekend(year, month, day)) {
      return null;
    }

    const unavailableDate = await db
      .select()
      .from(providerUnavailableDates)
      .where(
        and(
          eq(providerUnavailableDates.providerId, data.providerId),
          eq(providerUnavailableDates.unavailableDate, data.appointmentDate),
        ),
      )
      .get();

    if (unavailableDate) {
      return null;
    }

    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.providerId, data.providerId),
          eq(appointments.appointmentDate, data.appointmentDate),
          ne(appointments.status, "cancelado"),
        ),
      )
      .get();

    if (existingAppointment) {
      return null;
    }

    const appointment = await db
      .insert(appointments)
      .values({
        serviceId: data.serviceId,
        providerId: data.providerId,
        clientId: data.clientId,
        appointmentDate: data.appointmentDate,
        status: "pendente_pagamento",
      })
      .returning()
      .get();

    return appointment;
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
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .innerJoin(services, eq(services.id, appointments.serviceId))
      .innerJoin(users, eq(users.id, appointments.providerId));
  }

  async findByProviderId(providerId: number) {
    return db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
        serviceId: appointments.serviceId,
        serviceName: services.name,
        providerId: appointments.providerId,
        clientId: appointments.clientId,
        clientName: users.name,
        price: services.price,
        cancellationReason: appointments.cancellationReason,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .innerJoin(services, eq(services.id, appointments.serviceId))
      .innerJoin(users, eq(users.id, appointments.clientId))
      .where(eq(appointments.providerId, providerId));
  }

  async completeByClient(id: number) {
    const result = await db
      .update(appointments)
      .set({
        status: "concluido",
        completedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(
        and(eq(appointments.id, id), eq(appointments.status, "confirmado")),
      )
      .returning();

    return result[0] ?? null;
  }
  async cancel(id: number, reason: string) {
    const result = await db
      .update(appointments)
      .set({
        status: "cancelado",
        cancellationReason: reason,
      })
      .where(and(eq(appointments.id, id), eq(appointments.status, "pendente")))
      .returning();

    return result[0] ?? null;
  }

  async findByClientId(clientId: number) {
    return db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
        serviceId: appointments.serviceId,
        serviceName: services.name,
        providerId: appointments.providerId,
        providerName: users.name,
        clientId: appointments.clientId,
        price: services.price,
        cancellationReason: appointments.cancellationReason,
        createdAt: appointments.createdAt,
        completedAt: appointments.completedAt,
      })
      .from(appointments)
      .innerJoin(services, eq(services.id, appointments.serviceId))
      .innerJoin(users, eq(users.id, appointments.providerId))
      .where(eq(appointments.clientId, clientId));
  }
}
