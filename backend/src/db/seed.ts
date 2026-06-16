import bcrypt from "bcryptjs";
import { db } from "./index";
import { appointments, providerAvailability, providerRequests, reviews, salesLogs, services, transactions, users } from "./schema";

async function seed() {
  console.log("Limpando dados existentes...");

  await db.delete(reviews);
  await db.delete(salesLogs);
  await db.delete(transactions);
  await db.delete(appointments);
  await db.delete(providerAvailability);
  await db.delete(services);
  await db.delete(providerRequests);
  await db.delete(users);

  console.log("Dados antigos removidos.");

  const passwordHash = await bcrypt.hash("123456", 10);
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  const createdUsers = await db
    .insert(users)
    .values([
      {
        name: "Admin",
        email: "admin@conectserv.com",
        passwordHash: adminPasswordHash,
        role: "admin"
      },
      {
        name: "Maria Cliente",
        email: "maria@teste.com",
        passwordHash,
        role: "cliente",
        phone: "(61) 99999-0000",
        identity: "1234567"
      },
      {
        name: "João Prestador",
        email: "joao@teste.com",
        passwordHash,
        role: "prestador",
        phone: "(61) 98888-0000",
        identity: "7654321"
      }
    ])
    .returning();

  const provider = createdUsers.find((user) => user.role === "prestador");
  const client = createdUsers.find((user) => user.role === "cliente");

  if (!provider || !client) {
    throw new Error("Usuário de teste não criado.");
  }

  const createdServices = await db.insert(services).values([
    {
      name: "Instalação de chuveiro",
      description: "Serviço de instalação de chuveiro residencial.",
      price: 120,
      category: "Manutenção e Reparos",
      subcategory: "Elétrica",
      estimatedTime: "2 horas",
      location: "Brasília, DF",
      providerId: provider.id
    },
    {
      name: "Limpeza residencial",
      description: "Serviço de limpeza para apartamentos e casas.",
      price: 180,
      category: "Limpeza e Organização",
      subcategory: "Residencial",
      estimatedTime: "4 horas",
      location: "Brasília, DF",
      providerId: provider.id
    }
  ]).returning();

  await db.insert(providerAvailability).values([
    { providerId: provider.id, dayOfWeek: 1, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: provider.id, dayOfWeek: 2, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: provider.id, dayOfWeek: 3, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: provider.id, dayOfWeek: 4, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: provider.id, dayOfWeek: 5, startTime: "08:00", endTime: "18:00", slotDuration: 60 }
  ]);

  console.log("Dados de teste inseridos com sucesso.");
}

seed();