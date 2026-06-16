import { Router } from "express";
import { UsersRepository } from "../repositories/users.repository";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { saveImageAsWebp } from "../utils/image";

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

usersRoutes.get("/providers", async (request, response) => {
  const providers = await usersRepository.findAllProviders();
  return response.json(providers);
});

usersRoutes.get("/providers/featured", async (request, response) => {
  const providers = await usersRepository.findFeaturedProviders();
  return response.json(providers);
});

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

usersRoutes.put(
  "/profile",
  authMiddleware,
  upload.single("profileImage"),
  async (request, response) => {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const { name, phone, identity } = request.body;
    let profileImageUrl: string | null | undefined = undefined;

    if (request.file) {
      profileImageUrl = await saveImageAsWebp(request.file.path, "profiles");
    }

    const user = await usersRepository.updateProfile(request.user.id, {
      name,
      phone,
      identity,
      ...(profileImageUrl !== undefined ? { profileImageUrl } : {})
    });

    if (!user) {
      return response.status(404).json({ message: "Usuário não encontrado" });
    }

    return response.json(user);
  }
);

export { usersRoutes };