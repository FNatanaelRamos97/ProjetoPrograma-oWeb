import type { Request, Response } from "express";
import { z } from "zod";
import { ProviderRequestsRepository } from "../repositories/provider-requests.repository";
import { UsersRepository } from "../repositories/users.repository";

const providerRequestsRepository = new ProviderRequestsRepository();
const usersRepository = new UsersRepository();

const createProviderRequestSchema = z.object({
  message: z.string().optional().default("")
});

export class ProviderRequestsController {
  async create(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const data = createProviderRequestSchema.parse(request.body);

    const user = await usersRepository.findById(request.user.id);

    if (!user) {
      return response.status(404).json({ message: "Usuário não encontrado" });
    }

    if (user.role === "prestador") {
      return response.status(400).json({ message: "Usuário já é prestador" });
    }

    const providerRequest = await providerRequestsRepository.create(
      request.user.id,
      data.message
    );

    await usersRepository.updateRole(request.user.id, "prestador_pendente");

    return response.status(201).json(providerRequest);
  }

  async findAll(request: Request, response: Response) {
    const requests = await providerRequestsRepository.findAll();
    return response.json(requests);
  }

  async approve(request: Request, response: Response) {
    const id = Number(request.params.id);

    const providerRequest = await providerRequestsRepository.findById(id);

    if (!providerRequest) {
      return response.status(404).json({ message: "Solicitação não encontrada" });
    }

    await providerRequestsRepository.updateStatus(id, "aprovado");

    const user = await usersRepository.updateRole(providerRequest.userId, "prestador");

    return response.json({
      message: "Solicitação aprovada",
      user
    });
  }

  async reject(request: Request, response: Response) {
    const id = Number(request.params.id);

    const providerRequest = await providerRequestsRepository.findById(id);

    if (!providerRequest) {
      return response.status(404).json({ message: "Solicitação não encontrada" });
    }

    await providerRequestsRepository.updateStatus(id, "recusado");

    const user = await usersRepository.updateRole(providerRequest.userId, "cliente");

    return response.json({
      message: "Solicitação recusada",
      user
    });
  }
}