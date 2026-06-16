import type { Request, Response } from "express";
import { z } from "zod";
import { CancellationRepository } from "../repositories/cancellation.repository";

const cancellationRepository = new CancellationRepository();

const createSchema = z.object({
  appointmentId: z.number().int().positive(),
  reason: z.string().min(1, "Motivo é obrigatório"),
});

const adminActionSchema = z.object({
  adminNote: z.string().optional(),
});

export class CancellationController {
  async create(request: Request, response: Response) {
    try {
      if (!request.user) {
        return response.status(401).json({ message: "Usuário não autenticado" });
      }

      const data = createSchema.parse(request.body);

      const result = await cancellationRepository.createRequest(
        data.appointmentId,
        request.user.id,
        data.reason,
      );

      if (!result) {
        return response.status(409).json({
          message: "Já existe uma solicitação pendente para este agendamento.",
        });
      }

      return response.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ message: "Dados inválidos." });
      }

      console.error("Erro ao criar solicitação de cancelamento:", error);
      return response.status(500).json({ message: "Erro ao criar solicitação." });
    }
  }

  async listMy(request: Request, response: Response) {
    try {
      if (!request.user) {
        return response.status(401).json({ message: "Usuário não autenticado" });
      }

      const requests = await cancellationRepository.findByClientId(
        request.user.id,
      );

      return response.json(requests);
    } catch (error) {
      console.error("Erro ao listar solicitações:", error);
      return response.status(500).json({ message: "Erro ao listar solicitações." });
    }
  }

  async listAll(request: Request, response: Response) {
    try {
      const requests = await cancellationRepository.findAll();
      return response.json(requests);
    } catch (error) {
      console.error("Erro ao listar solicitações:", error);
      return response.status(500).json({ message: "Erro ao listar solicitações." });
    }
  }

  async approve(request: Request, response: Response) {
    try {
      const id = Number(request.params.id);
      if (!id) {
        return response.status(400).json({ message: "ID inválido." });
      }

      const data = adminActionSchema.parse(request.body);
      const result = await cancellationRepository.approve(id, data.adminNote);

      if (!result) {
        return response.status(400).json({
          message: "Solicitação não encontrada ou já foi processada.",
        });
      }

      return response.json({ message: "Cancelamento aprovado com sucesso." });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ message: "Dados inválidos." });
      }

      console.error("Erro ao aprovar cancelamento:", error);
      return response.status(500).json({ message: "Erro ao aprovar cancelamento." });
    }
  }

  async reject(request: Request, response: Response) {
    try {
      const id = Number(request.params.id);
      if (!id) {
        return response.status(400).json({ message: "ID inválido." });
      }

      const data = adminActionSchema.parse(request.body);
      const result = await cancellationRepository.reject(id, data.adminNote);

      if (!result) {
        return response.status(400).json({
          message: "Solicitação não encontrada ou já foi processada.",
        });
      }

      return response.json({ message: "Cancelamento recusado." });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ message: "Dados inválidos." });
      }

      console.error("Erro ao recusar cancelamento:", error);
      return response.status(500).json({ message: "Erro ao recusar cancelamento." });
    }
  }
}
