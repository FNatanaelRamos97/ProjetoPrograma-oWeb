import type { Request, Response } from "express";
import { AdminRepository } from "../repositories/admin.repository";
import { UsersRepository } from "../repositories/users.repository";
import { ServicesRepository } from "../repositories/services.repository";
import { AppointmentsRepository } from "../repositories/appointments.repository";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { appointments, services } from "../db/schema";

const adminRepository = new AdminRepository();
const usersRepository = new UsersRepository();
const servicesRepository = new ServicesRepository();
const appointmentsRepository = new AppointmentsRepository();

export class AdminController {
  async dashboard(request: Request, response: Response) {
    const dashboard = await adminRepository.dashboard();
    return response.json(dashboard);
  }

  async users(request: Request, response: Response) {
    const users = await usersRepository.findAll();
    return response.json(users);
  }

  async services(request: Request, response: Response) {
    const services = await servicesRepository.findAll();
    return response.json(services);
  }

  async appointments(request: Request, response: Response) {
    const appointments = await appointmentsRepository.findAll();
    return response.json(appointments);
  }

  async listAppointments(request: Request, response: Response) {
    const data = await db
      .select({
        id: appointments.id,
        serviceId: appointments.serviceId,
        providerId: appointments.providerId,
        clientId: appointments.clientId,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
        createdAt: appointments.createdAt,
        serviceName: services.name,
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id));

    return response.json(data);
  }
}
