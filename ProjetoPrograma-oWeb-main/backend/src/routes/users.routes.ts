import { Router } from "express";
import { UsersRepository } from "../repositories/users.repository";

const usersRoutes = Router();
const usersRepository = new UsersRepository();

usersRoutes.get("/", async (request, response) => {
  const users = await usersRepository.findAll();

  return response.json(users);
});

usersRoutes.get("/:id", async (request, response) => {
  const id = Number(request.params.id);

  const user = await usersRepository.findById(id);

  if (!user) {
    return response.status(404).json({
      message: "Usuário não encontrado"
    });
  }

  return response.json(user);
});

export { usersRoutes };