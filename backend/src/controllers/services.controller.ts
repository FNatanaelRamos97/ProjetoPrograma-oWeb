import type { Request, Response } from "express";
import { createServiceSchema, updateServiceSchema } from "../dtos/services.dto";
import { ServicesRepository } from "../repositories/services.repository";
import { UsersRepository } from "../repositories/users.repository";
import { saveImageAsWebp } from "../utils/image";

const servicesRepository = new ServicesRepository();
const usersRepository = new UsersRepository();

export class ServicesController {
  async create(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const data = createServiceSchema.parse(request.body);

    const provider = await usersRepository.findById(request.user.id);

    if (!provider) {
      return response.status(404).json({
        message: "Prestador não encontrado"
      });
    }

    if (provider.role !== "prestador" && provider.role !== "admin") {
      return response.status(400).json({
        message: "Somente prestadores ou administradores podem cadastrar serviços"
      });
    }

    let imageUrls: string[] = [];

    const files = request.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await saveImageAsWebp(file.path, "services");
        imageUrls.push(url);
      }
    } else if (request.file) {
      const url = await saveImageAsWebp(request.file.path, "services");
      imageUrls.push(url);
    }

    const service = await servicesRepository.create({
      ...data,
      providerId: request.user.id,
      imageUrls
    });

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
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const id = Number(request.params.id);

    const deleted = await servicesRepository.delete(id, request.user.id);

    if (!deleted && request.user.role !== "admin") {
      return response.status(404).json({
        message: "Serviço não encontrado ou usuário sem permissão"
      });
    }

    return response.status(204).send();
  }
}