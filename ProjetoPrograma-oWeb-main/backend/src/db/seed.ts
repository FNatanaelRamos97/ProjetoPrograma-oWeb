import bcrypt from "bcryptjs";
import { db } from "./index";
import { users, services } from "./schema";

async function seed() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const createdUsers = await db
    .insert(users)
    .values([
      {
        name: "Maria Cliente",
        email: "maria@teste.com",
        passwordHash,
        role: "cliente"
      },
      {
        name: "João Prestador",
        email: "joao@teste.com",
        passwordHash,
        role: "prestador"
      }
    ])
    .returning();

  const provider = createdUsers.find((user) => user.role === "prestador");

  if (!provider) {
    throw new Error("Prestador de teste não criado.");
  }

  await db.insert(services).values([
    {
      name: "Instalação de chuveiro",
      description: "Serviço de instalação de chuveiro residencial.",
      price: 120,
      category: "Elétrica",
      providerId: provider.id
    },
    {
      name: "Limpeza residencial",
      description: "Serviço de limpeza para apartamentos e casas.",
      price: 180,
      category: "Limpeza",
      providerId: provider.id
    }
  ]);

  console.log("Dados de teste inseridos com sucesso.");
}

seed();