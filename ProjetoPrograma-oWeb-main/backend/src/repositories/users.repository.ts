import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

type CreateUserRepositoryDTO = {
  name: string;
  email: string;
  passwordHash: string;
  role: "cliente" | "prestador";
};

export class UsersRepository {
  async create(data: CreateUserRepositoryDTO) {
    const result = await db
      .insert(users)
      .values(data)
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
      });

    return result[0];
  }

  async findByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return result[0] ?? null;
  }

  async findById(id: number) {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, id));

    return result[0] ?? null;
  }

  async findAll() {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
      })
      .from(users);
  }
}