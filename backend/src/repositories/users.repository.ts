import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { users, services, reviews, appointments } from "../db/schema";

type UserRole = "cliente" | "prestador" | "prestador_pendente" | "admin";

type CreateUserRepositoryDTO = {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  identity?: string;
  profileImageUrl?: string | null;
  role?: UserRole;
};

export class UsersRepository {
  async create(data: CreateUserRepositoryDTO) {
    const result = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        phone: data.phone,
        identity: data.identity,
        profileImageUrl: data.profileImageUrl ?? null,
        role: data.role ?? "cliente"
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        identity: users.identity,
        profileImageUrl: users.profileImageUrl,
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
        phone: users.phone,
        identity: users.identity,
        profileImageUrl: users.profileImageUrl,
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
        phone: users.phone,
        identity: users.identity,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        createdAt: users.createdAt
      })
      .from(users);
  }

  async findAllProviders() {
    return db
      .select({
        id: users.id,
        name: users.name,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .where(eq(users.role, "prestador"));
  }

  async findFeaturedProviders() {
    const providers = await db
      .select({
        id: users.id,
        name: users.name,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .where(eq(users.role, "prestador"));

    if (providers.length === 0) return [];

    const providerIds = providers.map((p) => p.id);

    const servicesByProvider = new Map<number, string>();
    const rows = await db
      .select({
        providerId: services.providerId,
        category: services.category,
      })
      .from(services)
      .where(inArray(services.providerId, providerIds));
    for (const row of rows) {
      if (!servicesByProvider.has(row.providerId)) {
        servicesByProvider.set(row.providerId, row.category);
      }
    }

    const ratingsByProvider = new Map<number, number>();
    const avgRating = sql<number>`ROUND(AVG(${reviews.rating}), 1)`;
    const ratingRows = await db
      .select({
        providerId: reviews.providerId,
        avgRating,
      })
      .from(reviews)
      .where(inArray(reviews.providerId, providerIds))
      .groupBy(reviews.providerId);
    for (const row of ratingRows) {
      ratingsByProvider.set(row.providerId, row.avgRating);
    }

    const jobsByProvider = new Map<number, number>();
    const jobRows = await db
      .select({
        providerId: appointments.providerId,
        count: sql<number>`COUNT(*)`,
      })
      .from(appointments)
      .where(
        and(
          inArray(appointments.providerId, providerIds),
          eq(appointments.status, "concluido"),
        ),
      )
      .groupBy(appointments.providerId);
    for (const row of jobRows) {
      jobsByProvider.set(row.providerId, row.count);
    }

    return providers.map((p) => ({
      id: p.id,
      name: p.name,
      profileImageUrl: p.profileImageUrl,
      specialty: servicesByProvider.get(p.id) ?? "",
      rating: ratingsByProvider.get(p.id) ?? 0,
      jobs: jobsByProvider.get(p.id) ?? 0,
    }));
  }

  async updateRole(id: number, role: UserRole) {
    const result = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role
      });

    return result[0] ?? null;
  }

  async updateProfile(id: number, data: {
    name?: string;
    phone?: string;
    identity?: string;
    profileImageUrl?: string | null;
  }) {
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.identity !== undefined) updateData.identity = data.identity;
    if (data.profileImageUrl !== undefined) updateData.profileImageUrl = data.profileImageUrl;

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        identity: users.identity,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        createdAt: users.createdAt
      });

    return result[0] ?? null;
  }
}