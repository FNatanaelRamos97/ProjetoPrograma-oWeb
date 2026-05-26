import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  phone: text("phone"),
  identity: text("identity"),
  facebook: text("facebook"),
  profileImageUrl: text("profile_image_url"),

  role: text("role", {
    enum: ["cliente", "prestador", "prestador_pendente", "admin"]
  })
    .notNull()
    .default("cliente"),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: real("price").notNull(),

  category: text("category").notNull().default(""),
  subcategory: text("subcategory").notNull().default(""),
  estimatedTime: text("estimated_time").notNull().default(""),
  location: text("location").notNull().default(""),
  imageUrl: text("image_url"),

  providerId: integer("provider_id")
    .notNull()
    .references(() => users.id),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
});

export const providerRequests = sqliteTable("provider_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id),

  status: text("status", {
    enum: ["pendente", "aprovado", "recusado"]
  })
    .notNull()
    .default("pendente"),

  message: text("message").notNull().default(""),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
});

export const providerAvailability = sqliteTable("provider_availability", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  providerId: integer("provider_id")
    .notNull()
    .references(() => users.id),

  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull()
});

export const appointments = sqliteTable(
  "appointments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id),

    providerId: integer("provider_id")
      .notNull()
      .references(() => users.id),

    clientId: integer("client_id")
      .notNull()
      .references(() => users.id),

    appointmentDate: text("appointment_date").notNull(),

    status: text("status", {
      enum: ["pendente", "confirmado", "cancelado"]
    })
      .notNull()
      .default("pendente"),

    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => ({
    uniqueProviderDate: uniqueIndex("appointments_provider_date_unique")
      .on(table.providerId, table.appointmentDate)
  })
);