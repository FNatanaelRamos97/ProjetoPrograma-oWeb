import type { Request, Response } from "express";
import { createServiceSchema, updateServiceSchema } from "../dtos/services.dto";
import { ServicesRepository } from "../repositories/services.repository";
import { UsersRepository } from "../repositories/users.repository";

const servicesRepository = new ServicesRepository();
const usersRepository = new UsersRepository();

export class ServicesController {
  async create(request: Request, response: Response) {
    const data = createServiceSchema.parse(request.body);

    const provider = await usersRepository.findById(data.providerId);

    if (!provider) {
      return response.status(404).json({
        message: "Prestador não encontrado"
      });
    }

    if (provider.role !== "prestador") {
      return response.status(400).json({
        message: "Somente prestadores podem cadastrar serviços"
      });
    }

    const service = await servicesRepository.create(data);

    return response.status(201).json(service);
  }

  async findAll(request: Request, response: Response) {
    const services = await servicesRepository.findAll();

    return response.json(services);
  }

  async findByProvider(request: Request, response: Response) {
    const providerId = Number(request.params.providerId);

    const services = await servicesRepository.findByProviderId(providerId);

    return response.json(services);
  }

  async findById(request: Request, response: Response) {
    const id = Number(request.params.id);

    const service = await servicesRepository.findById(id);

    if (!service) {
      return response.status(404).json({
        message: "Serviço não encontrado"
      });
    }

    return response.json(service);
  }

  async update(request: Request, response: Response) {
    const id = Number(request.params.id);
    const data = updateServiceSchema.parse(request.body);

    const service = await servicesRepository.update(id, data);

    if (!service) {
      return response.status(404).json({
        message: "Serviço não encontrado"
      });
    }

    return response.json(service);
  }

  async delete(request: Request, response: Response) {
    const id = Number(request.params.id);
    const providerId = Number(request.query.providerId);

    const deleted = await servicesRepository.delete(id, providerId);

    if (!deleted) {
      return response.status(404).json({
        message: "Serviço não encontrado ou usuário sem permissão"
      });
    }

    return response.status(204).send();
  }
}