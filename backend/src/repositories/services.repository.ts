import { eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { services, users, serviceImages, reviews } from "../db/schema";
import type { CreateServiceDTO, UpdateServiceDTO } from "../dtos/services.dto";
import { sql } from "drizzle-orm";

type CreateServiceRepositoryDTO = CreateServiceDTO & {
  providerId: number;
  imageUrls?: string[];
};

async function attachRatings(serviceRows: any[]) {
  if (serviceRows.length === 0) return serviceRows;

  const rows = await Promise.all(
    serviceRows.map(async (service) => {
      const result = await db
        .select({
          avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
          count: sql<number>`COUNT(${reviews.id})`,
        })
        .from(reviews)
        .where(eq(reviews.serviceId, service.id));

      return {
        ...service,
        averageRating: Number(result[0]?.avg ?? 0),
        totalReviews: Number(result[0]?.count ?? 0),
      };
    }),
  );

  return rows;
}

async function attachServiceImages(serviceRows: any[]) {
  if (serviceRows.length === 0) return [];
  const ids = serviceRows.map((s) => s.id);
  const images = await db
    .select()
    .from(serviceImages)
    .where(inArray(serviceImages.serviceId, ids))
    .orderBy(serviceImages.sortOrder);

  const imageMap: Record<number, string[]> = {};
  for (const img of images) {
    if (!imageMap[img.serviceId]) imageMap[img.serviceId] = [];
    imageMap[img.serviceId].push(img.imageUrl);
  }

  return serviceRows.map((s) => ({
    ...s,
    imageUrls: imageMap[s.id] || [],
  }));
}

export class ServicesRepository {
  async create(data: CreateServiceRepositoryDTO) {
    const imageUrls = data.imageUrls || [];
    const primaryImage = imageUrls[0] || null;

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
        imageUrl: primaryImage,
        providerId: data.providerId,
      })
      .returning();

    const service = result[0];

    if (imageUrls.length > 0) {
      await db.insert(serviceImages).values(
        imageUrls.map((url, i) => ({
          serviceId: service.id,
          imageUrl: url,
          sortOrder: i,
        })),
      );
    }

    return { ...service, imageUrls };
  }

  async findAll() {
    const rows = await db
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
        provider_name: users.name,
        provider_image: users.profileImageUrl,
      })
      .from(services)
      .innerJoin(users, eq(users.id, services.providerId))
      .orderBy(services.id);

    const withImages = await attachServiceImages(rows);
    return attachRatings(withImages);
  }

  async findByProviderId(providerId: number) {
    const rows = await db
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
        provider_name: users.name,
        provider_image: users.profileImageUrl,
      })
      .from(services)
      .innerJoin(users, eq(users.id, services.providerId))
      .where(eq(services.providerId, providerId));

    const withImages = await attachServiceImages(rows);
    return attachRatings(withImages);
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
        provider_name: users.name,
        provider_image: users.profileImageUrl,
      })
      .from(services)
      .innerJoin(users, eq(users.id, services.providerId))
      .where(eq(services.id, id));

    const service = result[0] ?? null;
    if (!service) return null;

    const images = await db
      .select()
      .from(serviceImages)
      .where(eq(serviceImages.serviceId, id))
      .orderBy(serviceImages.sortOrder);

    const withRating = await attachRatings([
      { ...service, imageUrls: images.map((i) => i.imageUrl) },
    ]);
    return withRating[0];
    return { ...service, imageUrls: images.map((i) => i.imageUrl) };
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

    await db.delete(serviceImages).where(eq(serviceImages.serviceId, id));
    await db.delete(services).where(eq(services.id, id));

    return true;
  }
}
