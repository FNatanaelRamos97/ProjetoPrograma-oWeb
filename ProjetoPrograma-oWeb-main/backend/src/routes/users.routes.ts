import { Router } from "express";
import { UsersRepository } from "../repositories/users.repository";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const usersRoutes = Router();
const usersRepository = new UsersRepository();

usersRoutes.get(
  "/",
  authMiddleware,
  requireRole(["admin"]),
  async (request, response) => {
    const users = await usersRepository.findAll();
    return response.json(users);
  }
);

usersRoutes.get("/:id", authMiddleware, async (request, response) => {
  const id = Number(request.params.id);

  if (request.user?.role !== "admin" && request.user?.id !== id) {
    return response.status(403).json({
      message: "Acesso negado"
    });
  }

  const user = await usersRepository.findById(id);

  if (!user) {
    return response.status(404).json({
      message: "Usuário não encontrado"
    });
  }

  return response.json(user);
});

export { usersRoutes };