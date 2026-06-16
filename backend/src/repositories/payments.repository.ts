import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import {
  appointments,
  payments,
  salesLogs,
  services,
  transactions,
  users
} from "../db/schema";

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export class PaymentsRepository {
  async getAppointmentForCheckout(appointmentId: number, clientId: number) {
    const result = await db
      .select({
        appointmentId: appointments.id,
        appointmentStatus: appointments.status,
        appointmentDate: appointments.appointmentDate,
        serviceId: services.id,
        serviceName: services.name,
        servicePrice: services.price,
        clientId: appointments.clientId,
        providerId: appointments.providerId,
        providerName: users.name
      })
      .from(appointments)
      .innerJoin(services, eq(services.id, appointments.serviceId))
      .innerJoin(users, eq(users.id, appointments.providerId))
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.clientId, clientId)
        )
      );

    return result[0] ?? null;
  }

  async createCheckoutRecord(data: {
    appointmentId: number;
    serviceId: number;
    clientId: number;
    providerId: number;
    grossAmount: number;
    commissionAmount: number;
    providerAmount: number;
    stripeCheckoutSessionId: string;
    gateway?: string;
  }) {
    const result = await db
      .insert(payments)
      .values({
        appointmentId: data.appointmentId,
        serviceId: data.serviceId,
        clientId: data.clientId,
        providerId: data.providerId,
        grossAmount: data.grossAmount,
        commissionAmount: data.commissionAmount,
        providerAmount: data.providerAmount,
        stripeCheckoutSessionId: data.stripeCheckoutSessionId,
        gateway: data.gateway ?? "stripe",
        status: "checkout_criado"
      })
      .returning();

    return result[0];
  }

  async findByGatewaySessionId(stripeCheckoutSessionId: string) {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.stripeCheckoutSessionId, stripeCheckoutSessionId));

    return result[0] ?? null;
  }

  async findByAppointmentId(appointmentId: number) {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.appointmentId, appointmentId))
      .limit(1);

    return result[0] ?? null;
  }

  async markPaymentAsPaid(data: {
    stripeCheckoutSessionId: string;
    stripePaymentIntentId?: string | null;
  }) {
    const existing = await this.findByGatewaySessionId(data.stripeCheckoutSessionId);

    if (!existing) return null;
    if (existing.status === "pago") return existing;

    const now = new Date();

    const updated = await db
      .update(payments)
      .set({
        status: "pago",
        stripePaymentIntentId: data.stripePaymentIntentId ?? null,
        paidAt: now.toISOString(),
        cancelDeadlineAt: addHours(now, 48)
      })
      .where(eq(payments.id, existing.id))
      .returning();

    await db
      .update(appointments)
      .set({ status: "confirmado" })
      .where(eq(appointments.id, existing.appointmentId));

    await db.insert(salesLogs).values({
      appointmentId: existing.appointmentId,
      serviceId: existing.serviceId,
      clientId: existing.clientId,
      providerId: existing.providerId,
      amount: existing.grossAmount,
      paymentMethod: existing.gateway === "mercadopago"
        ? "Mercado Pago"
        : existing.gateway === "abacatepay"
          ? "Abacate Pay"
          : "Stripe Checkout",
      status: "pago"
    });

    const alreadyHasProviderTx = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, existing.providerId),
          eq(transactions.referenceType, "appointment"),
          eq(transactions.referenceId, existing.appointmentId),
          eq(transactions.type, "recebimento")
        )
      );

    if (!alreadyHasProviderTx[0]) {
      await db.insert(transactions).values({
        userId: existing.providerId,
        type: "recebimento",
        amount: existing.providerAmount,
        description: `Valor líquido do serviço #${existing.appointmentId}`,
        status: "bloqueado",
        referenceType: "appointment",
        referenceId: existing.appointmentId
      });
    }

    return updated[0];
  }

  async cancelPaidAppointment(appointmentId: number, clientId: number, reason: string) {
    const result = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.appointmentId, appointmentId),
          eq(payments.clientId, clientId),
          eq(payments.status, "pago")
        )
      );

    const payment = result[0];
    if (!payment) return { ok: false, message: "Pagamento não encontrado." };

    if (!payment.cancelDeadlineAt) {
      return { ok: false, message: "Prazo de cancelamento não encontrado." };
    }

    if (new Date() > new Date(payment.cancelDeadlineAt)) {
      return { ok: false, message: "Cancelamento disponível apenas até 48h após o pagamento." };
    }

    await db
      .update(payments)
      .set({ status: "cancelado" })
      .where(eq(payments.id, payment.id));

    await db
      .update(appointments)
      .set({
        status: "cancelado",
        cancellationReason: reason
      })
      .where(eq(appointments.id, appointmentId));

    await db
      .update(transactions)
      .set({
        status: "devolvido",
        cancellationReason: reason
      })
      .where(
        and(
          eq(transactions.referenceType, "appointment"),
          eq(transactions.referenceId, appointmentId),
          eq(transactions.status, "bloqueado")
        )
      );

    return { ok: true, message: "Agendamento cancelado." };
  }

  async releaseProviderAmount(appointmentId: number) {
    await db
      .update(transactions)
      .set({ status: "liberado" })
      .where(
        and(
          eq(transactions.referenceType, "appointment"),
          eq(transactions.referenceId, appointmentId),
          eq(transactions.type, "recebimento"),
          eq(transactions.status, "bloqueado")
        )
      );

    const providerTx = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.referenceType, "appointment"),
          eq(transactions.referenceId, appointmentId),
          eq(transactions.type, "recebimento")
        )
      );

    const tx = providerTx[0];

    if (tx) {
      await db
        .update(users)
        .set({ balance: sql`${users.balance} + ${tx.amount}` })
        .where(eq(users.id, tx.userId));
    }

    await db
      .update(salesLogs)
      .set({ status: "concluido" })
      .where(eq(salesLogs.appointmentId, appointmentId));

    return true;
  }
}
