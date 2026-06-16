import { z } from "zod";

export const createReviewSchema = z.object({
  appointmentId: z.number().int().positive(),
  serviceId: z.number().int().positive(),
  providerId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().default("")
});

export type CreateReviewDTO = z.infer<typeof createReviewSchema>;
