import type { Request, Response } from "express";
import { z } from "zod";
import { AppointmentsRepository } from "../repositories/appointments.repository";
import { WalletRepository } from "../repositories/wallet.repository";
import { PaymentsRepository } from "../repositories/payments.repository";

const appointmentsRepository = new AppointmentsRepository();
const walletRepository = new WalletRepository();
const paymentsRepository = new PaymentsRepository();

const createAppointmentSchema = z.object({
  serviceId: z.number().int().positive(),
  providerId: z.number().int().positive(),
  appointmentDate: z.string().min(10),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
});

const cancelSchema = z.object({
  cancellationReason: z.string().min(1, "Motivo do cancelamento é obrigatório"),
});

export class AppointmentsController {
  async availability(request: Request, response: Response) {
    const providerId = Number(request.params.providerId);
    const year = Number(request.query.year);
    const month = Number(request.query.month);

    if (!providerId || !year || !month) {
      return response.status(400).json({
        message: "providerId, year e month são obrigatórios",
      });
    }

    const availability = await appointmentsRepository.findAvailability(
      providerId,
      year,
      month,
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
      clientId: request.user.id,
    });

    if (!appointment) {
      return response.status(409).json({
        message: "Data indisponível para esse prestador",
      });
    }

    return response.status(201).json(appointment);
  }

  async findAll(request: Request, response: Response) {
    const appointments = await appointmentsRepository.findAll();
    return response.json(appointments);
  }

  async listMyAppointments(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const appointments = await appointmentsRepository.findByClientId(
      request.user.id,
    );
    return response.json(appointments);
  }

  async confirm(request: Request, response: Response) {
    const id = Number(request.params.id);

    const appointment = await appointmentsRepository.completeByClient(id);

    if (!appointment) {
      return response.status(404).json({
        message: "Agendamento não encontrado ou ainda não pago",
      });
    }

    await walletRepository.releasePayment("appointment", id);

    return response.json(appointment);
  }

  async listMyProviderAppointments(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const appointments = await appointmentsRepository.findByProviderId(
      request.user.id,
    );

    return response.json(appointments);
  }

  async cancel(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const id = Number(request.params.id);
    const data = cancelSchema.parse(request.body);

    const result = await paymentsRepository.cancelPaidAppointment(
      id,
      request.user.id,
      data.cancellationReason,
    );

    if (!result.ok) {
      return response.status(400).json({ message: result.message });
    }

    return response.json({ message: result.message });
  }
}
