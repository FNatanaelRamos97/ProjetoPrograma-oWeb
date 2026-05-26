import { eq } from "drizzle-orm";
import { db } from "../db";
import { services, users } from "../db/schema";
import type { CreateServiceDTO, UpdateServiceDTO } from "../dtos/services.dto";

type CreateServiceRepositoryDTO = CreateServiceDTO & {
  providerId: number;
  imageUrl?: string | null;
};

export class ServicesRepository {
  async create(data: CreateServiceRepositoryDTO) {
    const result = await db
      .insert(services)
      .values({
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        subcategory: data.subcategory,
        estimatedTime: data.estimatedTime,
        location: data.location,
        imageUrl: data.imageUrl ?? null,
        providerId: data.providerId
      })
      .returning();

    return result[0];
  }

  async findAll() {
    return db
      .select({
        id: services.id,
        name: services.name,
        description: services.description,
        price: services.price,
        category: services.category,
        subcategory: services.subcategory,
        estimatedTime: services.estimatedTime,
        location: services.location,
        imageUrl: services.imageUrl,
        provider_id: services.providerId,
        provider_name: users.name
      })
      .from(services)
      .innerJoin(users, eq(users.id, services.providerId))
      .orderBy(services.id);
  }

  async findByProviderId(providerId: number) {
    return db
      .select({
        id: services.id,
        name: services.name,
        description: services.description,
        price: services.price,
        category: services.category,
        subcategory: services.subcategory,
        estimatedTime: services.estimatedTime,
        location: services.location,
        imageUrl: services.imageUrl,
        provider_id: services.providerId,
        provider_name: users.name
      })
      .from(services)
      .innerJoin(users, eq(users.id, services.providerId))
      .where(eq(services.providerId, providerId));
  }

  async findById(id: number) {
    const result = await db
      .select({
        id: services.id,
        name: services.name,
        description: services.description,
        price: services.price,
        category: services.category,
        subcategory: services.subcategory,
        estimatedTime: services.estimatedTime,
        location: services.location,
        imageUrl: services.imageUrl,
        provider_id: services.providerId,
        provider_name: users.name
      })
      .from(services)
      .innerJoin(users, eq(users.id, services.providerId))
      .where(eq(services.id, id));

    return result[0] ?? null;
  }

  async update(id: number, data: UpdateServiceDTO) {
    const result = await db
      .update(services)
      .set(data)
      .where(eq(services.id, id))
      .returning();

    return result[0] ?? null;
  }

  async delete(id: number, providerId: number) {
    const existing = await db
      .select()
      .from(services)
      .where(eq(services.id, id));

    const service = existing[0];

    if (!service) return false;
    if (service.providerId !== providerId) return false;

    await db.delete(services).where(eq(services.id, id));

    return true;
  }
}