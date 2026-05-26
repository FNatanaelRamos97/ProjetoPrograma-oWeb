import type { Request, Response } from "express";
import { z } from "zod";
import { AppointmentsRepository } from "../repositories/appointments.repository";

const appointmentsRepository = new AppointmentsRepository();

const createAppointmentSchema = z.object({
  serviceId: z.number().int().positive(),
  providerId: z.number().int().positive(),
  appointmentDate: z.string().min(10)
});

export class AppointmentsController {
  async availability(request: Request, response: Response) {
    const providerId = Number(request.params.providerId);
    const year = Number(request.query.year);
    const month = Number(request.query.month);

    if (!providerId || !year || !month) {
      return response.status(400).json({
        message: "providerId, year e month são obrigatórios"
      });
    }

    const availability = await appointmentsRepository.findAvailability(
      providerId,
      year,
      month
    );

    return response.json(availability);
  }

  async create(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const data = createAppointmentSchema.parse(request.body);

    const appointment = await appointmentsRepository.create({
      ...data,
      clientId: request.user.id
    });

    if (!appointment) {
      return response.status(409).json({
        message: "Data indisponível para esse prestador"
      });
    }

    return response.status(201).json(appointment);
  }

  async findAll(request: Request, response: Response) {
    const appointments = await appointmentsRepository.findAll();
    return response.json(appointments);
  }
}