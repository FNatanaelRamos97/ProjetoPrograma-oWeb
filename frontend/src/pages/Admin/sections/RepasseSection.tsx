import type { WithdrawalRequest } from "@db/database";
import styles from "./Sections.module.css";

interface Props {
  withdrawalRequests: WithdrawalRequest[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export default function RepassesSection({
  withdrawalRequests,
  onApprove,
  onReject
}: Props) {
  const totalSolicitado = withdrawalRequests
    .filter((item) => item.status === "solicitado")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalPago = withdrawalRequests
    .filter((item) => item.status === "pago")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionStatsRow}>
        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Solicitações</span>
          <span className={styles.statCardValue}>{withdrawalRequests.length}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Pendentes</span>
          <span className={styles.statCardValue}>
            {withdrawalRequests.filter((item) => item.status === "solicitado").length}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Valor pendente</span>
          <span className={styles.statCardValue}>
            R$ {totalSolicitado.toFixed(2).replace(".", ",")}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Valor pago</span>
          <span className={styles.statCardValue}>
            R$ {totalPago.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h3 className={styles.tableCardTitle}>Solicitações de Repasse</h3>
        </div>

        <div className={styles.profTable}>
          <div className={styles.profTableHeader}>
            <span>Prestador</span>
            <span>Valor</span>
            <span>Status</span>
            <span>Data</span>
            <span>Ações</span>
          </div>

          {withdrawalRequests.length === 0 ? (
            <p className={styles.emptyText}>Nenhuma solicitação de repasse.</p>
          ) : (
            withdrawalRequests.map((item) => (
              <div key={item.id} className={styles.profTableRow}>
                <span>{item.providerName ?? `Prestador #${item.providerId}`}</span>

                <span className={styles.valueCell}>
                  R$ {item.amount.toFixed(2).replace(".", ",")}
                </span>

                <span
                  className={`${styles.statusBadgeMin} ${
                    item.status === "pago"
                      ? styles.badgeApproved
                      : item.status === "recusado"
                        ? styles.badgeRejected
                        : styles.badgePending
                  }`}
                >
                  {item.status}
                </span>

                <span className={styles.dateCell}>
                  {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                </span>

                <span>
                  {item.status === "solicitado" ? (
                    <>
                      <button
                        className={styles.approveBtn}
                        onClick={() => onApprove(item.id)}
                      >
                        Aprovar
                      </button>

                      <button
                        className={styles.rejectBtn}
                        onClick={() => onReject(item.id)}
                      >
                        Recusar
                      </button>
                    </>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}