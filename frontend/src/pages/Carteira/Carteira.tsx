import { useEffect, useState } from "react";
import NavBar from "../../components/NavBar/NavBar";
import { useAuth } from "../../contexts/AuthContext";
import {
  getWalletFullBalance,
  getWalletHistory,
  getMyWithdrawalRequests,
  requestWithdrawal,
  type WithdrawalRequest,
} from "@db/database";
import type { Transaction, WalletBalance } from "../../types";

export default function Carteira() {
  const { token, isPrestador, isAdmin } = useAuth();

  const [balance, setBalance] = useState<WalletBalance>({
    balance: 0,
    available: 0,
    escrow: 0,
  });

  const [history, setHistory] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  async function loadWallet() {
    if (!token) return;

    const [balanceData, historyData, withdrawalData] = await Promise.all([
      getWalletFullBalance(token),
      getWalletHistory(token),
      getMyWithdrawalRequests(token),
    ]);

    setBalance(balanceData);
    setHistory(historyData);
    setWithdrawals(withdrawalData);
  }

  useEffect(() => {
    loadWallet();
  }, [token]);

  async function handleRequestWithdrawal() {
    if (!token) return;

    const value = Number(amount.replace(",", "."));

    if (!value || value <= 0) {
      setMessage("Informe um valor válido.");
      return;
    }

    const result = await requestWithdrawal(
      value,
      "Solicitação de repasse do prestador",
      token,
    );

    if (!result) {
      setMessage(
        "Não foi possível solicitar o repasse. Verifique o saldo disponível.",
      );
      return;
    }

    setAmount("");
    setMessage("Solicitação enviada para análise do admin.");
    await loadWallet();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0f1a", color: "#fff" }}>
      <NavBar />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: 32 }}>
        <h1>Carteira</h1>
        <p>
          Acompanhe valores bloqueados, saldo disponível e solicitações de
          repasse.
        </p>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginTop: 24,
          }}
        >
          <div style={{ background: "#111827", padding: 20, borderRadius: 16 }}>
            <span>Saldo total</span>
            <h2>R$ {balance.balance.toFixed(2).replace(".", ",")}</h2>
          </div>

          <div style={{ background: "#111827", padding: 20, borderRadius: 16 }}>
            <span>Disponível para saque</span>
            <h2>R$ {balance.available.toFixed(2).replace(".", ",")}</h2>
          </div>

          <div style={{ background: "#111827", padding: 20, borderRadius: 16 }}>
            <span>Bloqueado</span>
            <h2>R$ {balance.escrow.toFixed(2).replace(".", ",")}</h2>
          </div>
        </section>

        {(isPrestador || isAdmin) && (
          <section
            style={{
              background: "#111827",
              padding: 20,
              borderRadius: 16,
              marginTop: 24,
            }}
          >
            <h2>Solicitar repasse</h2>

            <input
              value={amount}
              type="number"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Valor do repasse"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #334155",
                marginRight: 8,
              }}
            />

            <button
              onClick={handleRequestWithdrawal}
              style={{
                padding: 12,
                borderRadius: 14,
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(37, 99, 235, 0.25)",
                fontWeight: 600
              }}
            >
              Solicitar saque
            </button>

            {message && <p>{message}</p>}
          </section>
        )}

        <section
          style={{
            background: "#111827",
            padding: 20,
            borderRadius: 16,
            marginTop: 24,
          }}
        >
          <h2>Minhas solicitações</h2>

          {withdrawals.length === 0 ? (
            <p>Nenhuma solicitação registrada.</p>
          ) : (
            withdrawals.map((item) => (
              <div
                key={item.id}
                style={{ borderBottom: "1px solid #334155", padding: "12px 0" }}
              >
                <strong>R$ {item.amount.toFixed(2).replace(".", ",")}</strong>
                <span style={{ marginLeft: 12 }}>{item.status}</span>
                <small style={{ display: "block", color: "#94a3b8" }}>
                  {new Date(item.createdAt).toLocaleString("pt-BR")}
                </small>
              </div>
            ))
          )}
        </section>

        <section
          style={{
            background: "#111827",
            padding: 20,
            borderRadius: 16,
            marginTop: 24,
          }}
        >
          <h2>Histórico financeiro</h2>

          {history.length === 0 ? (
            <p>Nenhuma transação registrada.</p>
          ) : (
            history.map((tx) => (
              <div
                key={tx.id}
                style={{ borderBottom: "1px solid #334155", padding: "12px 0" }}
              >
                <strong>{tx.type}</strong>
                <span style={{ marginLeft: 12 }}>
                  R$ {tx.amount.toFixed(2).replace(".", ",")}
                </span>
                <span style={{ marginLeft: 12 }}>{tx.status}</span>
                <small style={{ display: "block", color: "#94a3b8" }}>
                  {tx.description}
                </small>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
