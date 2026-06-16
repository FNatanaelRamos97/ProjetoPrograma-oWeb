import { and, eq, like, ne } from "drizzle-orm";
import { db } from "../db";
import {
  appointments,
  providerAvailability,
  providerAvailabilityOverrides,
  providerUnavailableSlots,
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

function parseTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number,
) {
  const slots: { time: string; endTime: string; duration: number }[] = [];
  let current = parseTime(startTime);
  const end = parseTime(endTime);

  while (current + slotDuration <= end) {
    const startStr = `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`;
    current += slotDuration;
    const endStr = `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`;
    slots.push({ time: startStr, endTime: endStr, duration: slotDuration });
  }

  return slots;
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

    const weeklySchedule = await db
      .select()
      .from(providerAvailability)
      .where(eq(providerAvailability.providerId, providerId));

    const overrides = await db
      .select()
      .from(providerAvailabilityOverrides)
      .where(
        and(
          eq(providerAvailabilityOverrides.providerId, providerId),
          like(
            providerAvailabilityOverrides.specificDate,
            `${monthPrefix}%`,
          ),
        ),
      );

    const blockedSlots = await db
      .select()
      .from(providerUnavailableSlots)
      .where(eq(providerUnavailableSlots.providerId, providerId));

    const unavailableSet = new Set(
      unavailableDates.map((item) => item.unavailableDate),
    );

    const appointmentsMap = new Map<string, Set<string>>();
    for (const apt of providerAppointments) {
      if (!appointmentsMap.has(apt.appointmentDate)) {
        appointmentsMap.set(apt.appointmentDate, new Set());
      }
      appointmentsMap.get(apt.appointmentDate)!.add(apt.appointmentTime);
    }

    const scheduleMap = new Map(
      weeklySchedule.map((s) => [s.dayOfWeek, s]),
    );

    const overridesMap = new Map(
      overrides.map((o) => [o.specificDate, o]),
    );

    const blockedSlotsMap = new Map<string, Set<string>>();
    for (const bs of blockedSlots) {
      if (!blockedSlotsMap.has(bs.unavailableDate)) {
        blockedSlotsMap.set(bs.unavailableDate, new Set());
      }
      blockedSlotsMap.get(bs.unavailableDate)!.add(bs.startTime);
    }

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = getDateString(year, month, day);
      const dateObj = new Date(year, month - 1, day);
      const weekDay = dateObj.getDay();

      const weekend = weekDay === 0 || weekDay === 6;

      if (unavailableSet.has(date)) {
        return {
          date,
          day,
          available: false,
          reason: "Prestador indisponível",
          slots: [],
        };
      }

      const override = overridesMap.get(date);
      const entry = override ?? scheduleMap.get(weekDay);

      if (!entry) {
        return {
          date,
          day,
          available: false,
          reason: weekend ? "Fim de semana" : "Horários não definidos",
          slots: [],
        };
      }

      const allSlots = generateTimeSlots(
        entry.startTime,
        entry.endTime,
        entry.slotDuration,
      );

      const bookedSlotsForDate = appointmentsMap.get(date) ?? new Set();
      const blockedSlotsForDate = blockedSlotsMap.get(date) ?? new Set();

      const slots = allSlots.map((slot) => ({
        ...slot,
        available: !bookedSlotsForDate.has(slot.time) && !blockedSlotsForDate.has(slot.time),
      }));

      return {
        date,
        day,
        available: slots.some((s) => s.available),
        reason: null,
        slots,
      };
    });
  }

  async create(data: {
    serviceId: number;
    providerId: number;
    clientId: number;
    appointmentDate: string;
    appointmentTime: string;
  }) {
    const [year, month, day] = data.appointmentDate.split("-").map(Number);

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
          eq(appointments.appointmentTime, data.appointmentTime),
          ne(appointments.status, "cancelado"),
        ),
      )
      .get();

    if (existingAppointment) {
      return null;
    }

    const blockedSlot = await db
      .select()
      .from(providerUnavailableSlots)
      .where(
        and(
          eq(providerUnavailableSlots.providerId, data.providerId),
          eq(providerUnavailableSlots.unavailableDate, data.appointmentDate),
          eq(providerUnavailableSlots.startTime, data.appointmentTime),
        ),
      )
      .get();

    if (blockedSlot) {
      return null;
    }

    const appointment = await db
      .insert(appointments)
      .values({
        serviceId: data.serviceId,
        providerId: data.providerId,
        clientId: data.clientId,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
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
        appointmentTime: appointments.appointmentTime,
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
        appointmentTime: appointments.appointmentTime,
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
        completedAt: new Date().toISOString(),
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
        appointmentTime: appointments.appointmentTime,
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
