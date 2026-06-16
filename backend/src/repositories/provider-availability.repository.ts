import { and, eq, like } from "drizzle-orm";
import { db } from "../db";
import {
  providerAvailability,
  providerAvailabilityOverrides,
  providerUnavailableSlots,
} from "../db/schema";

export interface WeeklyScheduleEntry {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface OverrideEntry {
  id?: number;
  specificDate: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface BlockedSlot {
  id: number;
  unavailableDate: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export class ProviderAvailabilityRepository {
  async getWeeklySchedule(providerId: number) {
    return db
      .select()
      .from(providerAvailability)
      .where(eq(providerAvailability.providerId, providerId))
      .orderBy(providerAvailability.dayOfWeek);
  }

  async updateWeeklySchedule(
    providerId: number,
    entries: WeeklyScheduleEntry[],
  ) {
    await db
      .delete(providerAvailability)
      .where(eq(providerAvailability.providerId, providerId));

    if (entries.length === 0) return;

    await db.insert(providerAvailability).values(
      entries.map((entry) => ({
        providerId,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        slotDuration: entry.slotDuration,
      })),
    );
  }

  async getOverrides(providerId: number, year: number, month: number) {
    const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;

    return db
      .select()
      .from(providerAvailabilityOverrides)
      .where(
        and(
          eq(providerAvailabilityOverrides.providerId, providerId),
          like(providerAvailabilityOverrides.specificDate, `${monthPrefix}%`),
        ),
      );
  }

  async saveOverride(
    providerId: number,
    data: OverrideEntry,
  ) {
    const existing = await db
      .select()
      .from(providerAvailabilityOverrides)
      .where(
        and(
          eq(providerAvailabilityOverrides.providerId, providerId),
          eq(providerAvailabilityOverrides.specificDate, data.specificDate),
        ),
      )
      .get();

    if (existing) {
      const result = await db
        .update(providerAvailabilityOverrides)
        .set({
          startTime: data.startTime,
          endTime: data.endTime,
          slotDuration: data.slotDuration,
        })
        .where(eq(providerAvailabilityOverrides.id, existing.id))
        .returning()
        .get();

      return result;
    }

    const result = await db
      .insert(providerAvailabilityOverrides)
      .values({
        providerId,
        specificDate: data.specificDate,
        startTime: data.startTime,
        endTime: data.endTime,
        slotDuration: data.slotDuration,
      })
      .returning()
      .get();

    return result;
  }

  async deleteOverride(overrideId: number) {
    await db
      .delete(providerAvailabilityOverrides)
      .where(eq(providerAvailabilityOverrides.id, overrideId));
  }

  async getBlockedSlots(providerId: number) {
    return db
      .select()
      .from(providerUnavailableSlots)
      .where(eq(providerUnavailableSlots.providerId, providerId));
  }

  async getBlockedSlotsByDate(providerId: number, date: string) {
    return db
      .select()
      .from(providerUnavailableSlots)
      .where(
        and(
          eq(providerUnavailableSlots.providerId, providerId),
          eq(providerUnavailableSlots.unavailableDate, date),
        ),
      );
  }

  async blockSlot(data: {
    providerId: number;
    unavailableDate: string;
    startTime: string;
    endTime: string;
    reason?: string;
  }) {
    const result = await db
      .insert(providerUnavailableSlots)
      .values({
        providerId: data.providerId,
        unavailableDate: data.unavailableDate,
        startTime: data.startTime,
        endTime: data.endTime,
        reason: data.reason || "Indisponível",
      })
      .returning()
      .get();

    return result;
  }

  async unblockSlot(slotId: number) {
    await db
      .delete(providerUnavailableSlots)
      .where(eq(providerUnavailableSlots.id, slotId));
  }
}
