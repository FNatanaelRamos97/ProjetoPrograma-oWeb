import type { Request, Response } from "express";
import { AdminRepository } from "../repositories/admin.repository";
import { UsersRepository } from "../repositories/users.repository";
import { ServicesRepository } from "../repositories/services.repository";
import { AppointmentsRepository } from "../repositories/appointments.repository";

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
}