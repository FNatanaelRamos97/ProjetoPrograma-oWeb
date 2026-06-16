import type { SalesLog } from '../../../types'
import styles from './Sections.module.css'

interface Props {
  salesLogs: SalesLog[]
}

export default function VendasSection({ salesLogs }: Props) {
  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionStatsRow}>
        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Receita Total</span>
          <span className={styles.statCardValue}>R$ {salesLogs.reduce((s, l) => s + l.amount, 0).toFixed(2)}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Total de Vendas</span>
          <span className={styles.statCardValue}>{salesLogs.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Concluídas</span>
          <span className={styles.statCardValue}>{salesLogs.filter(l => l.status === 'confirmado').length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Pendentes</span>
          <span className={styles.statCardValue}>{salesLogs.filter(l => l.status === 'pendente').length}</span>
        </div>
      </div>
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h3 className={styles.tableCardTitle}>Histórico de Vendas</h3>
          <div className={styles.tableFilters}>
            <input className={styles.searchInput} type="text" placeholder="Buscar cliente..." />
            <select className={styles.filterSelect}>
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="confirmado">Confirmado</option>
            </select>
            <button className={styles.exportBtn}>Exportar CSV</button>
          </div>
        </div>
        <div className={styles.profTable}>
          <div className={styles.profTableHeader}>
            <span>Cliente</span><span>Valor</span><span>Pagamento</span><span>Status</span><span>Data</span>
          </div>
          {salesLogs.length === 0 ? (
            <p className={styles.emptyText}>Nenhuma venda registrada.</p>
          ) : salesLogs.map((log) => (
            <div key={log.id} className={styles.profTableRow}>
              <span>{log.clientName ?? '—'}</span>
              <span className={styles.valueCell}>R$ {log.amount.toFixed(2)}</span>
              <span>{log.paymentMethod}</span>
              <span><span className={`${styles.statusBadgeMin} ${log.status === 'confirmado' ? styles.badgeApproved : log.status === 'pendente' ? styles.badgePending : ''}`}>{log.status}</span></span>
              <span className={styles.dateCell}>{new Date(log.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
