import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(3, "Nome do serviço deve ter no mínimo 3 caracteres"),
  description: z.string().default(""),
  price: z.coerce.number().positive("Preço deve ser maior que zero"),
  category: z.string().default(""),
  subcategory: z.string().default(""),
  estimatedTime: z.string().default(""),
  location: z.string().default("")
});

export const updateServiceSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  estimatedTime: z.string().optional(),
  location: z.string().optional()
});

export type CreateServiceDTO = z.infer<typeof createServiceSchema>;
export type UpdateServiceDTO = z.infer<typeof updateServiceSchema>;