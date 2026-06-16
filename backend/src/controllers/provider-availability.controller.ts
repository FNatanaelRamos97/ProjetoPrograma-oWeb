import type { Request, Response } from "express";
import { z } from "zod";
import { ProviderAvailabilityRepository } from "../repositories/provider-availability.repository";

const availabilityRepository = new ProviderAvailabilityRepository();

const weeklyScheduleSchema = z.object({
  entries: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      slotDuration: z.number().int().refine((v) => v === 30 || v === 60, {
        message: "slotDuration deve ser 30 ou 60",
      }),
    }),
  ),
});

const overrideSchema = z.object({
  specificDate: z.string().min(10),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDuration: z.number().int().refine((v) => v === 30 || v === 60, {
    message: "slotDuration deve ser 30 ou 60",
  }),
});

const blockSlotSchema = z.object({
  unavailableDate: z.string().min(10),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().optional(),
});

export class ProviderAvailabilityController {
  async getWeeklySchedule(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Não autenticado." });
    }

    const schedule = await availabilityRepository.getWeeklySchedule(
      request.user.id,
    );

    return response.json(schedule);
  }

  async updateWeeklySchedule(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Não autenticado." });
    }

    const data = weeklyScheduleSchema.parse(request.body);

    await availabilityRepository.updateWeeklySchedule(
      request.user.id,
      data.entries,
    );

    return response.json({ message: "Horários atualizados com sucesso." });
  }

  async getOverrides(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Não autenticado." });
    }

    const year = Number(request.query.year);
    const month = Number(request.query.month);

    if (!year || !month) {
      return response
        .status(400)
        .json({ message: "Ano e mês são obrigatórios." });
    }

    const overrides = await availabilityRepository.getOverrides(
      request.user.id,
      year,
      month,
    );

    return response.json(overrides);
  }

  async saveOverride(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Não autenticado." });
    }

    const data = overrideSchema.parse(request.body);

    const result = await availabilityRepository.saveOverride(
      request.user.id,
      data,
    );

    return response.status(201).json(result);
  }

  async deleteOverride(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Não autenticado." });
    }

    const id = Number(request.params.id);

    await availabilityRepository.deleteOverride(id);

    return response.json({ message: "Override removido." });
  }

  async blockSlot(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Não autenticado." });
    }

    const data = blockSlotSchema.parse(request.body);

    const result = await availabilityRepository.blockSlot({
      ...data,
      providerId: request.user.id,
    });

    return response.status(201).json(result);
  }

  async unblockSlot(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Não autenticado." });
    }

    const id = Number(request.params.id);

    await availabilityRepository.unblockSlot(id);

    return response.json({ message: "Slot desbloqueado." });
  }

  async getBlockedSlots(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Não autenticado." });
    }

    const slots = await availabilityRepository.getBlockedSlots(
      request.user.id,
    );

    return response.json(slots);
  }
}
