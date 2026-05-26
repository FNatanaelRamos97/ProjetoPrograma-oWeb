export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: "cliente" | "prestador" | "prestador_pendente" | "admin";
      };
    }
  }
}