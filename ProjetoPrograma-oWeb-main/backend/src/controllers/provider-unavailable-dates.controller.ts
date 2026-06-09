import { Request, Response } from "express";
import { and, eq, like } from "drizzle-orm";
import { db } from "../db";
import { providerUnavailableDates } from "../db/schema";

function getMonthPrefix(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export class ProviderUnavailableDatesController {
  async findMyUnavailableDates(request: Request, response: Response) {
    const userId = request.user?.id;
    const year = Number(request.query.year);
    const month = Number(request.query.month);

    if (!userId) {
      return response.status(401).json({ message: "Não autenticado." });
    }

    if (!year || !month) {
      return response.status(400).json({ message: "Ano e mês são obrigatórios." });
    }

    const monthPrefix = getMonthPrefix(year, month);

    const dates = await db
      .select()
      .from(providerUnavailableDates)
      .where(
        and(
          eq(providerUnavailableDates.providerId, userId),
          like(providerUnavailableDates.unavailableDate, `${monthPrefix}%`)
        )
      );

    return response.json(dates);
  }

  async findByProvider(request: Request, response: Response) {
    const providerId = Number(request.params.providerId);
    const year = Number(request.query.year);
    const month = Number(request.query.month);

    if (!providerId || !year || !month) {
      return response.status(400).json({ message: "Dados inválidos." });
    }

    const monthPrefix = getMonthPrefix(year, month);

    const dates = await db
      .select()
      .from(providerUnavailableDates)
      .where(
        and(
          eq(providerUnavailableDates.providerId, providerId),
          like(providerUnavailableDates.unavailableDate, `${monthPrefix}%`)
        )
      );

    return response.json(dates);
  }

  async toggleUnavailableDate(request: Request, response: Response) {
    const userId = request.user?.id;
    const { date, reason } = request.body;

    if (!userId) {
      return response.status(401).json({ message: "Não autenticado." });
    }

    if (!date) {
      return response.status(400).json({ message: "Data obrigatória." });
    }

    const existing = await db
      .select()
      .from(providerUnavailableDates)
      .where(
        and(
          eq(providerUnavailableDates.providerId, userId),
          eq(providerUnavailableDates.unavailableDate, date)
        )
      )
      .get();

    if (existing) {
      await db
        .delete(providerUnavailableDates)
        .where(eq(providerUnavailableDates.id, existing.id));

      return response.json({
        unavailable: false,
        date
      });
    }

    const inserted = await db
      .insert(providerUnavailableDates)
      .values({
        providerId: userId,
        unavailableDate: date,
        reason: reason || "Indisponível"
      })
      .returning()
      .get();

    return response.json({
      unavailable: true,
      date,
      data: inserted
    });
  }
}