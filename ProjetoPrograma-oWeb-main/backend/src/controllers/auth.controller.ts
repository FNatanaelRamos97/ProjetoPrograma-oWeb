import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UsersRepository } from "../repositories/users.repository";
import { loginUserSchema, registerUserSchema } from "../dtos/auth.dto";

const usersRepository = new UsersRepository();

export class AuthController {
  async register(request: Request, response: Response) {
    const data = registerUserSchema.parse(request.body);

    const existingUser = await usersRepository.findByEmail(data.email);

    if (existingUser) {
      return response.status(409).json({
        message: "Já existe um usuário cadastrado com este e-mail"
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await usersRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role
    });

    return response.status(201).json(user);
  }

  async login(request: Request, response: Response) {
    const data = loginUserSchema.parse(request.body);

    const user = await usersRepository.findByEmail(data.email);

    if (!user) {
      return response.status(401).json({
        message: "E-mail ou senha inválidos"
      });
    }

    const passwordIsValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!passwordIsValid) {
      return response.status(401).json({
        message: "E-mail ou senha inválidos"
      });
    }

    return response.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  }
}