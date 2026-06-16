import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
  appointments,
  cancellationRequests,
  payments,
  transactions,
  users,
  services,
} from "../db/schema";

export class CancellationRepository {
  async createRequest(
    appointmentId: number,
    clientId: number,
    reason: string,
  ) {
    const existing = await db
      .select()
      .from(cancellationRequests)
      .where(
        and(
          eq(cancellationRequests.appointmentId, appointmentId),
          eq(cancellationRequests.clientId, clientId),
          eq(cancellationRequests.status, "pendente"),
        ),
      )
      .get();

    if (existing) return null;

    const result = await db
      .insert(cancellationRequests)
      .values({ appointmentId, clientId, reason })
      .returning()
      .get();

    return result;
  }

  async findAll() {
    return db
      .select({
        id: cancellationRequests.id,
        appointmentId: cancellationRequests.appointmentId,
        clientId: cancellationRequests.clientId,
        clientName: users.name,
        reason: cancellationRequests.reason,
        status: cancellationRequests.status,
        adminNote: cancellationRequests.adminNote,
        createdAt: cancellationRequests.createdAt,
        decidedAt: cancellationRequests.decidedAt,
        appointmentDate: appointments.appointmentDate,
        appointmentStatus: appointments.status,
      })
      .from(cancellationRequests)
      .innerJoin(users, eq(users.id, cancellationRequests.clientId))
      .innerJoin(appointments, eq(appointments.id, cancellationRequests.appointmentId))
      .orderBy(cancellationRequests.createdAt);
  }

  async findByClientId(clientId: number) {
    return db
      .select({
        id: cancellationRequests.id,
        appointmentId: cancellationRequests.appointmentId,
        reason: cancellationRequests.reason,
        status: cancellationRequests.status,
        adminNote: cancellationRequests.adminNote,
        createdAt: cancellationRequests.createdAt,
        decidedAt: cancellationRequests.decidedAt,
      })
      .from(cancellationRequests)
      .where(eq(cancellationRequests.clientId, clientId))
      .orderBy(cancellationRequests.createdAt);
  }

  async findByAppointmentId(appointmentId: number) {
    return db
      .select()
      .from(cancellationRequests)
      .where(eq(cancellationRequests.appointmentId, appointmentId))
      .orderBy(cancellationRequests.createdAt);
  }

  async approve(requestId: number, adminNote?: string) {
    const request = await db
      .select()
      .from(cancellationRequests)
      .where(eq(cancellationRequests.id, requestId))
      .get();

    if (!request || request.status !== "pendente") return null;

    const payment = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.appointmentId, request.appointmentId),
          eq(payments.status, "pago"),
        ),
      )
      .get();

    await db
      .update(cancellationRequests)
      .set({
        status: "aprovado",
        adminNote: adminNote ?? null,
        decidedAt: new Date().toISOString(),
      })
      .where(eq(cancellationRequests.id, requestId));

    await db
      .update(appointments)
      .set({ status: "cancelado", cancellationReason: request.reason })
      .where(eq(appointments.id, request.appointmentId));

    if (payment) {
      await db
        .update(payments)
        .set({ status: "cancelado" })
        .where(eq(payments.id, payment.id));

      const providerTx = await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.referenceType, "appointment"),
            eq(transactions.referenceId, request.appointmentId),
            eq(transactions.status, "bloqueado"),
          ),
        )
        .get();

      if (providerTx) {
        await db
          .update(transactions)
          .set({ status: "devolvido", cancellationReason: request.reason })
          .where(eq(transactions.id, providerTx.id));
      }
    }

    return { ok: true };
  }

  async reject(requestId: number, adminNote?: string) {
    const request = await db
      .select()
      .from(cancellationRequests)
      .where(eq(cancellationRequests.id, requestId))
      .get();

    if (!request || request.status !== "pendente") return null;

    await db
      .update(cancellationRequests)
      .set({
        status: "recusado",
        adminNote: adminNote ?? null,
        decidedAt: new Date().toISOString(),
      })
      .where(eq(cancellationRequests.id, requestId));

    return { ok: true };
  }
}
