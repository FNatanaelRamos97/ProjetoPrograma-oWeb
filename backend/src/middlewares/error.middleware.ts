import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  request,
  response,
  next
) => {
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Erro de validação",
      errors: error.flatten().fieldErrors
    });
  }

  console.error(error);

  return response.status(500).json({
    message: "Erro interno do servidor"
  });
};