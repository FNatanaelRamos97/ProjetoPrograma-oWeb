import type { Request, Response } from "express";
import { createReviewSchema } from "../dtos/reviews.dto";
import { ReviewsRepository } from "../repositories/reviews.repository";

const reviewsRepository = new ReviewsRepository();

export class ReviewsController {
  async create(request: Request, response: Response) {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const data = createReviewSchema.parse(request.body);

    const review = await reviewsRepository.create({
      ...data,
      clientId: request.user.id,
    });

    if (!review) {
      return response.status(409).json({
        message: "Você já avaliou este agendamento",
      });
    }

    return response.status(201).json(review);
  }

  async findByService(request: Request, response: Response) {
    const serviceId = Number(request.params.serviceId);

    const [reviews, avg] = await Promise.all([
      reviewsRepository.findByService(serviceId),
      reviewsRepository.getAverageRating(serviceId),
    ]);

    return response.json({ reviews, average: avg.avg, total: avg.count });
  }

  async findByProvider(request: Request, response: Response) {
    const providerId = Number(request.params.providerId);
    const reviews = await reviewsRepository.findByProvider(providerId);
    return response.json(reviews);
  }

  async findAllAdmin(request: Request, response: Response) {
    const reviews = await reviewsRepository.findAllAdmin();

    return response.json(reviews);
  }
}
