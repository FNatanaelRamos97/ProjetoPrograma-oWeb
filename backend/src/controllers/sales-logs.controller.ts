import type { Request, Response } from "express";
import { SalesLogsRepository } from "../repositories/sales-logs.repository";

const salesLogsRepository = new SalesLogsRepository();

export class SalesLogsController {
  async list(request: Request, response: Response) {
    const logs = await salesLogsRepository.findAll();
    return response.json(logs);
  }

  async stats(request: Request, response: Response) {
    const stats = await salesLogsRepository.getStats();
    return response.json(stats);
  }

  async recent(request: Request, response: Response) {
    const logs = await salesLogsRepository.getRecent();
    return response.json(logs);
  }
}
