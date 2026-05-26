import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type TokenPayload = {
  sub: number;
  role: "cliente" | "prestador" | "prestador_pendente" | "admin";
};

export function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ message: "Token não informado" });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return response.status(401).json({ message: "Token em formato inválido" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    request.user = {
      id: Number(decoded.sub),
      role: decoded.role
    };

    return next();
  } catch {
    return response.status(401).json({ message: "Token inválido" });
  }
}

export function requireRole(
  allowedRoles: Array<"cliente" | "prestador" | "prestador_pendente" | "admin">
) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ message: "Acesso negado" });
    }

    return next();
  };
}