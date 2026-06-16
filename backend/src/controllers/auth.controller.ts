import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UsersRepository } from "../repositories/users.repository";
import { loginUserSchema, registerUserSchema } from "../dtos/auth.dto";
import { saveImageAsWebp } from "../utils/image";

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

    let profileImageUrl: string | null = null;

    if (request.file) {
      profileImageUrl = await saveImageAsWebp(request.file.path, "profiles");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await usersRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone,
      identity: data.identity,
      profileImageUrl,
      role: "cliente"
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

    const token = jwt.sign(
      { role: user.role, id: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" } as jwt.SignOptions
    );

    return response.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        identity: user.identity,
        profileImageUrl: user.profileImageUrl,
        role: user.role
      }
    });
  }
}