import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  phone: text("phone"),
  identity: text("identity"),
  profileImageUrl: text("profile_image_url"),

  balance: real("balance").notNull().default(0),

  role: text("role", {
    enum: ["cliente", "prestador", "prestador_pendente", "admin"],
  })
    .notNull()
    .default("cliente"),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
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
    .default(sql`CURRENT_TIMESTAMP`),
});

export const providerRequests = sqliteTable("provider_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id),

  status: text("status", {
    enum: ["pendente", "aprovado", "recusado"],
  })
    .notNull()
    .default("pendente"),

  message: text("message").notNull().default(""),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const providerAvailability = sqliteTable("provider_availability", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  providerId: integer("provider_id")
    .notNull()
    .references(() => users.id),

  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  slotDuration: integer("slot_duration").notNull().default(60),
});

export const providerAvailabilityOverrides = sqliteTable(
  "provider_availability_overrides",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    providerId: integer("provider_id")
      .notNull()
      .references(() => users.id),

    specificDate: text("specific_date").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    slotDuration: integer("slot_duration").notNull().default(60),
  },
  (table) => ({
    uniqueProviderDate: uniqueIndex(
      "avail_overrides_provider_date_unique",
    ).on(table.providerId, table.specificDate),
  }),
);

export const providerUnavailableSlots = sqliteTable(
  "provider_unavailable_slots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    providerId: integer("provider_id")
      .notNull()
      .references(() => users.id),

    unavailableDate: text("unavailable_date").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    reason: text("reason").notNull().default("Indisponível"),

    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
);

export const providerUnavailableDates = sqliteTable(
  "provider_unavailable_dates",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    providerId: integer("provider_id")
      .notNull()
      .references(() => users.id),

    unavailableDate: text("unavailable_date").notNull(),

    reason: text("reason").notNull().default("Indisponível"),

    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    uniqueProviderUnavailableDate: uniqueIndex(
      "provider_unavailable_dates_provider_date_unique",
    ).on(table.providerId, table.unavailableDate),
  }),
);

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
    appointmentTime: text("appointment_time").notNull().default("00:00"),

    status: text("status", {
      enum: ["pendente", "pendente_pagamento", "confirmado", "concluido", "cancelado"],
    })
      .notNull()
      .default("pendente"),

    cancellationReason: text("cancellation_reason"),

    completedAt: text("completed_at"),

    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    uniqueProviderDateTime: uniqueIndex(
      "appointments_provider_datetime_unique",
    ).on(table.providerId, table.appointmentDate, table.appointmentTime),
  }),
);

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  appointmentId: integer("appointment_id")
    .notNull()
    .references(() => appointments.id),

  serviceId: integer("service_id")
    .notNull()
    .references(() => services.id),

  clientId: integer("client_id")
    .notNull()
    .references(() => users.id),

  providerId: integer("provider_id")
    .notNull()
    .references(() => users.id),

  rating: integer("rating").notNull(),
  comment: text("comment").notNull().default(""),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id),

  type: text("type", {
    enum: ["deposito", "saque", "pagamento", "recebimento", "estorno"],
  }).notNull(),

  amount: real("amount").notNull(),
  description: text("description").notNull().default(""),

  status: text("status", {
    enum: ["liberado", "bloqueado", "devolvido"],
  })
    .notNull()
    .default("liberado"),

  cancellationReason: text("cancellation_reason"),

  referenceType: text("reference_type"),
  referenceId: integer("reference_id"),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const serviceImages = sqliteTable("service_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  serviceId: integer("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),

  imageUrl: text("image_url").notNull(),

  sortOrder: integer("sort_order").notNull().default(0),
});

export const salesLogs = sqliteTable("sales_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  appointmentId: integer("appointment_id").references(() => appointments.id),

  serviceId: integer("service_id").references(() => services.id),

  clientId: integer("client_id")
    .notNull()
    .references(() => users.id),

  providerId: integer("provider_id")
    .notNull()
    .references(() => users.id),

  amount: real("amount").notNull(),
  paymentMethod: text("payment_method").notNull().default(""),
  status: text("status").notNull().default("pendente"),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const cancellationRequests = sqliteTable("cancellation_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  appointmentId: integer("appointment_id")
    .notNull()
    .references(() => appointments.id),

  clientId: integer("client_id")
    .notNull()
    .references(() => users.id),

  reason: text("reason").notNull(),

  status: text("status", {
    enum: ["pendente", "aprovado", "recusado"],
  })
    .notNull()
    .default("pendente"),

  adminNote: text("admin_note"),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  decidedAt: text("decided_at"),
});

export const payments = sqliteTable(
  "payments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    appointmentId: integer("appointment_id")
      .notNull()
      .references(() => appointments.id),

    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id),

    clientId: integer("client_id")
      .notNull()
      .references(() => users.id),

    providerId: integer("provider_id")
      .notNull()
      .references(() => users.id),

    grossAmount: real("gross_amount").notNull(),
    commissionAmount: real("commission_amount").notNull(),
    providerAmount: real("provider_amount").notNull(),

    currency: text("currency").notNull().default("brl"),
    gateway: text("gateway").notNull().default("stripe"),

    stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),

    status: text("status", {
      enum: ["checkout_criado", "pago", "cancelado", "reembolsado"]
    })
      .notNull()
      .default("checkout_criado"),

    paidAt: text("paid_at"),
    cancelDeadlineAt: text("cancel_deadline_at"),

    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => ({
    uniqueStripeSession: uniqueIndex("payments_stripe_session_unique")
      .on(table.stripeCheckoutSessionId)
  })
);

export const withdrawalRequests = sqliteTable("withdrawal_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  providerId: integer("provider_id")
    .notNull()
    .references(() => users.id),

  amount: real("amount").notNull(),

  status: text("status", {
    enum: ["solicitado", "aprovado", "recusado", "pago"]
  })
    .notNull()
    .default("solicitado"),

  description: text("description").notNull().default("Solicitação de repasse"),

  adminNote: text("admin_note"),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  decidedAt: text("decided_at")
});
