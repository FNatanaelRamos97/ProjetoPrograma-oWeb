import type { Request, Response } from "express";
import { z } from "zod";
import { WalletRepository } from "../repositories/wallet.repository";

const walletRepository = new WalletRepository();

const amountSchema = z.object({
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  description: z.string().default(""),
});

const holdSchema = z.object({
  clientId: z.number().int().positive(),
  providerId: z.number().int().positive(),
  amount: z.coerce.number().positive(),
  description: z.string().default(""),
  referenceType: z.string(),
  referenceId: z.number().int().positive(),
});

const releaseSchema = z.object({
  referenceType: z.string(),
  referenceId: z.number().int().positive(),
});

const cancelSchema = z.object({
  referenceType: z.string(),
  referenceId: z.number().int().positive(),
  cancellationReason: z.string().min(1, "Motivo do cancelamento é obrigatório"),
});

const withdrawalRequestSchema = z.object({
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  description: z.string().optional().default("Solicitação de repasse"),
});

const withdrawalDecisionSchema = z.object({
  adminNote: z.string().optional().default(""),
});

export class WalletController {
  async balance(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const [balance, available, escrow] = await Promise.all([
      walletRepository.getBalance(request.user.id),
      walletRepository.getAvailableBalance(request.user.id),
      walletRepository.getEscrowBalance(request.user.id),
    ]);

    return response.json({ balance, available, escrow });
  }

  async deposit(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const data = amountSchema.parse(request.body);
    const tx = await walletRepository.deposit(
      request.user.id,
      data.amount,
      data.description,
    );
    return response.status(201).json(tx);
  }

  async withdraw(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const data = amountSchema.parse(request.body);
    const tx = await walletRepository.withdraw(
      request.user.id,
      data.amount,
      data.description,
    );

    if (!tx) {
      return response
        .status(400)
        .json({ message: "Saldo disponível insuficiente" });
    }

    return response.status(201).json(tx);
  }

  async history(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const history = await walletRepository.getHistory(request.user.id);
    return response.json(history);
  }

  // ─── Escrow ──────────────────────────────────────────────

  async hold(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const data = holdSchema.parse(request.body);

    if (data.clientId !== request.user.id && request.user.role !== "admin") {
      return response.status(403).json({ message: "Acesso negado" });
    }

    const tx = await walletRepository.holdPayment(
      data.clientId,
      data.providerId,
      data.amount,
      data.description,
      data.referenceType,
      data.referenceId,
    );

    return response.status(201).json(tx);
  }

  async release(request: Request, response: Response) {
    const data = releaseSchema.parse(request.body);
    await walletRepository.releasePayment(data.referenceType, data.referenceId);
    return response.json({ message: "Pagamento liberado com sucesso" });
  }

  async cancel(request: Request, response: Response) {
    const data = cancelSchema.parse(request.body);
    await walletRepository.cancelPayment(
      data.referenceType,
      data.referenceId,
      data.cancellationReason,
    );
    return response.json({ message: "Pagamento cancelado e estornado" });
  }

  async escrowList(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const list = await walletRepository.getEscrowList(request.user.id);
    return response.json(list);
  }

  async allTransactions(request: Request, response: Response) {
    const transactions = await walletRepository.getAllTransactions();
    return response.json(transactions);
  }

  async requestWithdrawal(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    if (request.user.role !== "prestador" && request.user.role !== "admin") {
      return response
        .status(403)
        .json({ message: "Apenas prestadores podem solicitar repasse" });
    }

    const data = withdrawalRequestSchema.parse(request.body);

    const withdrawalRequest = await walletRepository.requestWithdrawal(
      request.user.id,
      data.amount,
      data.description,
    );

    if (!withdrawalRequest) {
      return response.status(400).json({
        message: "Saldo disponível insuficiente para solicitar este repasse",
      });
    }

    return response.status(201).json(withdrawalRequest);
  }

  async myWithdrawalRequests(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const requests = await walletRepository.listMyWithdrawalRequests(
      request.user.id,
    );

    return response.json(requests);
  }

  async allWithdrawalRequests(request: Request, response: Response) {
    const requests = await walletRepository.listAllWithdrawalRequests();

    return response.json(requests);
  }

  async approveWithdrawal(request: Request, response: Response) {
    const id = Number(request.params.id);
    const data = withdrawalDecisionSchema.parse(request.body);

    const withdrawalRequest = await walletRepository.approveWithdrawalRequest(
      id,
      data.adminNote,
    );

    if (!withdrawalRequest) {
      return response.status(400).json({
        message: "Não foi possível aprovar o repasse",
      });
    }

    return response.json(withdrawalRequest);
  }

  async rejectWithdrawal(request: Request, response: Response) {
    const id = Number(request.params.id);
    const data = withdrawalDecisionSchema.parse(request.body);

    const withdrawalRequest = await walletRepository.rejectWithdrawalRequest(
      id,
      data.adminNote,
    );

    if (!withdrawalRequest) {
      return response.status(400).json({
        message: "Não foi possível recusar o repasse",
      });
    }

    return response.json(withdrawalRequest);
  }
}
