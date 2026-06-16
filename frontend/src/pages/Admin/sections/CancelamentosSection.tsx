import { useEffect, useMemo, useState } from "react";
import {
  approveCancellationRequest,
  getAllCancellationRequests,
  rejectCancellationRequest,
} from "@db/database";
import type { CancellationRequest } from "../../../types";
import styles from "./Sections.module.css";

export default function CancelamentosSection() {
  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [filter, setFilter] = useState("todos");
  const [selected, setSelected] = useState<CancellationRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem("conectserv_token");

  useEffect(() => {
    async function load() {
      if (!token) return;
      const data = await getAllCancellationRequests(token);
      setRequests(data);
    }
    load();
  }, [token]);

  const filtered = useMemo(() => {
    if (filter === "todos") return requests;
    return requests.filter((r) => r.status === filter);
  }, [requests, filter]);

  const pendentes = requests.filter((r) => r.status === "pendente").length;
  const aprovados = requests.filter((r) => r.status === "aprovado").length;
  const recusados = requests.filter((r) => r.status === "recusado").length;

  async function handleApprove() {
    if (!token || !selected) return;
    setProcessing(true);
    const ok = await approveCancellationRequest(selected.id, token, adminNote || undefined);
    if (ok) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selected.id
            ? { ...r, status: "aprovado" as const, adminNote: adminNote || null }
            : r,
        ),
      );
      setSelected(null);
      setAdminNote("");
    }
    setProcessing(false);
  }

  async function handleReject() {
    if (!token || !selected) return;
    setProcessing(true);
    const ok = await rejectCancellationRequest(selected.id, token, adminNote || undefined);
    if (ok) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selected.id
            ? { ...r, status: "recusado" as const, adminNote: adminNote || null }
            : r,
        ),
      );
      setSelected(null);
      setAdminNote("");
    }
    setProcessing(false);
  }

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionStatsRow}>
        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Pendentes</span>
          <span className={styles.statCardValue}>{pendentes}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Aprovados</span>
          <span className={styles.statCardValue}>{aprovados}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Recusados</span>
          <span className={styles.statCardValue}>{recusados}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Total</span>
          <span className={styles.statCardValue}>{requests.length}</span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h3 className={styles.tableCardTitle}>Solicitações de Cancelamento</h3>
          <div className={styles.tableFilters}>
            <select
              className={styles.filterSelect}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovado">Aprovados</option>
              <option value="recusado">Recusados</option>
            </select>
          </div>
        </div>

        {selected ? (
          <div className={styles.requestDetail}>
            <button className={styles.backLink} onClick={() => { setSelected(null); setAdminNote(""); }}>
              ← Voltar para lista
            </button>
            <div className={styles.detailCard}>
              <h4 className={styles.detailName}>Solicitação #{selected.id}</h4>
              <span className={styles.detailEmail}>
                Cliente: {selected.clientName ?? `#${selected.clientId}`}
              </span>
              <span
                className={`${styles.requestBadge} ${
                  selected.status === "aprovado"
                    ? styles.badgeApproved
                    : selected.status === "recusado"
                      ? styles.badgeRejected
                      : styles.badgePending
                }`}
              >
                {selected.status === "aprovado"
                  ? "✓ Aprovado"
                  : selected.status === "recusado"
                    ? "✕ Recusado"
                    : "⏳ Pendente"}
              </span>

              <div className={styles.detailMsg}>
                <strong>Motivo:</strong>
                <p>{selected.reason}</p>
              </div>

              {selected.adminNote && (
                <div className={styles.detailMsg}>
                  <strong>Observação do admin:</strong>
                  <p>{selected.adminNote}</p>
                </div>
              )}

              <div className={styles.detailDate}>
                Solicitado em {new Date(selected.createdAt).toLocaleDateString("pt-BR")}
              </div>

              {selected.status === "pendente" && (
                <>
                  <div style={{ marginTop: 16, width: "100%" }}>
                    <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>
                      Observação (opcional)
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Nota do admin..."
                      rows={2}
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        padding: 10,
                        resize: "vertical",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0",
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <div className={styles.detailActions}>
                    <button
                      className={styles.approveBtn}
                      onClick={handleApprove}
                      disabled={processing}
                    >
                      {processing ? "Processando..." : "✓ Aprovar cancelamento"}
                    </button>
                    <button
                      className={styles.rejectBtn}
                      onClick={handleReject}
                      disabled={processing}
                    >
                      {processing ? "Processando..." : "✕ Recusar"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.profTable}>
              <div className={styles.profTableHeader}>
                <span>Cliente</span>
                <span>Motivo</span>
                <span>Data</span>
                <span>Status</span>
                <span>Ações</span>
              </div>
              {filtered.length === 0 ? (
                <p className={styles.emptyText}>Nenhuma solicitação encontrada.</p>
              ) : (
                filtered.map((req) => (
                  <div key={req.id} className={styles.profTableRow}>
                    <span>{req.clientName ?? `Cliente #${req.clientId}`}</span>
                    <span className={styles.requestMsgPreview}>
                      {req.reason.length > 40
                        ? `"${req.reason.slice(0, 40)}..."`
                        : `"${req.reason}"`}
                    </span>
                    <span className={styles.dateCell}>
                      {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                    <span>
                      <span
                        className={`${styles.requestBadge} ${
                          req.status === "aprovado"
                            ? styles.badgeApproved
                            : req.status === "recusado"
                              ? styles.badgeRejected
                              : styles.badgePending
                        }`}
                      >
                        {req.status === "aprovado"
                          ? "✓ Aprovado"
                          : req.status === "recusado"
                            ? "✕ Recusado"
                            : "⏳ Pendente"}
                      </span>
                    </span>
                    <div className={styles.requestActions}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelected(req)}
                      >
                        Detalhes
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
