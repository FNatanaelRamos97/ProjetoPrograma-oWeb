import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { transactions, users, withdrawalRequests } from "../db/schema";

export class WalletRepository {
  async getBalance(userId: number) {
    const user = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId));

    return user[0]?.balance ?? 0;
  }

  async getAvailableBalance(userId: number) {
    const result = await db
      .select({ total: sql`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.status, "liberado"),
        ),
      );

    return Number(result[0]?.total ?? 0);
  }

  async getEscrowBalance(userId: number) {
    const result = await db
      .select({ total: sql`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.status, "bloqueado"),
        ),
      );

    return Number(result[0]?.total ?? 0);
  }

  async deposit(userId: number, amount: number, description: string) {
    await db
      .update(users)
      .set({ balance: sql`${users.balance} + ${amount}` })
      .where(eq(users.id, userId));

    const tx = await db
      .insert(transactions)
      .values({
        userId,
        type: "deposito",
        amount,
        description,
        status: "liberado",
      })
      .returning();

    return tx[0];
  }

  async withdraw(userId: number, amount: number, description: string) {
    const available = await this.getAvailableBalance(userId);
    if (available < amount) return null;

    await db
      .update(users)
      .set({ balance: sql`${users.balance} - ${amount}` })
      .where(eq(users.id, userId));

    const tx = await db
      .insert(transactions)
      .values({
        userId,
        type: "saque",
        amount: -amount,
        description,
        status: "liberado",
      })
      .returning();

    return tx[0];
  }

  async holdPayment(
    clientId: number,
    providerId: number,
    amount: number,
    description: string,
    referenceType: string,
    referenceId: number,
  ) {
    await db
      .update(users)
      .set({ balance: sql`${users.balance} - ${amount}` })
      .where(eq(users.id, clientId));

    const outTx = await db
      .insert(transactions)
      .values({
        userId: clientId,
        type: "pagamento",
        amount: -amount,
        description,
        status: "bloqueado",
        referenceType,
        referenceId,
      })
      .returning();

    await db.insert(transactions).values({
      userId: providerId,
      type: "recebimento",
      amount,
      description,
      status: "bloqueado",
      referenceType,
      referenceId,
    });

    return outTx[0];
  }

  async releasePayment(referenceType: string, referenceId: number) {
    await db
      .update(transactions)
      .set({ status: "liberado" })
      .where(
        and(
          eq(transactions.referenceType, referenceType),
          eq(transactions.referenceId, referenceId),
          eq(transactions.status, "bloqueado"),
        ),
      );

    return true;
  }

  async cancelPayment(
    referenceType: string,
    referenceId: number,
    cancellationReason: string,
  ) {
    const txs = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.referenceType, referenceType),
          eq(transactions.referenceId, referenceId),
          eq(transactions.status, "bloqueado"),
        ),
      );

    const clientTx = txs.find((tx) => tx.type === "pagamento");
    const providerTx = txs.find((tx) => tx.type === "recebimento");

    if (clientTx) {
      await db
        .update(users)
        .set({ balance: sql`${users.balance} + ${Math.abs(clientTx.amount)}` })
        .where(eq(users.id, clientTx.userId));
    }

    await db
      .update(transactions)
      .set({
        status: "devolvido",
        cancellationReason,
      })
      .where(
        and(
          eq(transactions.referenceType, referenceType),
          eq(transactions.referenceId, referenceId),
          eq(transactions.status, "bloqueado"),
        ),
      );

    if (clientTx) {
      await db.insert(transactions).values({
        userId: clientTx.userId,
        type: "estorno",
        amount: Math.abs(clientTx.amount),
        description: `Estorno - ${cancellationReason}`,
        status: "liberado",
        referenceType,
        referenceId,
      });
    }

    return true;
  }

  async getEscrowList(userId: number) {
    return db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.status, "bloqueado"),
        ),
      )
      .orderBy(desc(transactions.createdAt));
  }

  async getHistory(userId: number) {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getAllTransactions() {
    return db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        type: transactions.type,
        amount: transactions.amount,
        description: transactions.description,
        status: transactions.status,
        cancellationReason: transactions.cancellationReason,
        referenceType: transactions.referenceType,
        referenceId: transactions.referenceId,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .orderBy(desc(transactions.createdAt));
  }

  async requestWithdrawal(
    providerId: number,
    amount: number,
    description: string,
  ) {
    const available = await this.getAvailableBalance(providerId);

    if (available < amount) {
      return null;
    }

    const result = await db
      .insert(withdrawalRequests)
      .values({
        providerId,
        amount,
        description: description || "Solicitação de repasse",
        status: "solicitado",
      })
      .returning();

    return result[0];
  }

  async listMyWithdrawalRequests(providerId: number) {
    return db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.providerId, providerId))
      .orderBy(desc(withdrawalRequests.createdAt));
  }

  async listAllWithdrawalRequests() {
    return db
      .select({
        id: withdrawalRequests.id,
        providerId: withdrawalRequests.providerId,
        providerName: users.name,
        providerEmail: users.email,
        amount: withdrawalRequests.amount,
        status: withdrawalRequests.status,
        description: withdrawalRequests.description,
        adminNote: withdrawalRequests.adminNote,
        createdAt: withdrawalRequests.createdAt,
        decidedAt: withdrawalRequests.decidedAt,
      })
      .from(withdrawalRequests)
      .innerJoin(users, eq(users.id, withdrawalRequests.providerId))
      .orderBy(desc(withdrawalRequests.createdAt));
  }

  async approveWithdrawalRequest(id: number, adminNote?: string) {
    const result = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, id));

    const request = result[0];

    if (!request || request.status !== "solicitado") {
      return null;
    }

    const available = await this.getAvailableBalance(request.providerId);

    if (available < request.amount) {
      return null;
    }

    await db.insert(transactions).values({
      userId: request.providerId,
      type: "saque",
      amount: -request.amount,
      description: `Repasse aprovado #${id}`,
      status: "liberado",
      referenceType: "withdrawal_request",
      referenceId: id,
    });

    await db
      .update(users)
      .set({
        balance: sql`${users.balance} - ${request.amount}`,
      })
      .where(eq(users.id, request.providerId));

    const updated = await db
      .update(withdrawalRequests)
      .set({
        status: "pago",
        adminNote: adminNote ?? null,
        decidedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(withdrawalRequests.id, id))
      .returning();

    return updated[0];
  }

  async rejectWithdrawalRequest(id: number, adminNote?: string) {
    const result = await db
      .update(withdrawalRequests)
      .set({
        status: "recusado",
        adminNote: adminNote ?? null,
        decidedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(
        and(
          eq(withdrawalRequests.id, id),
          eq(withdrawalRequests.status, "solicitado"),
        ),
      )
      .returning();

    return result[0] ?? null;
  }
}
