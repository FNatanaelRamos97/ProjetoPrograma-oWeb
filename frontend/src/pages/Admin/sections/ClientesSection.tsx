import { useState } from 'react'
import type { User } from '../../../types'
import styles from './Sections.module.css'

interface Props {
  users: User[]
}

export default function ClientesSection({ users }: Props) {
  const [selectedClient, setSelectedClient] = useState<User | null>(null)
  const clients = users.filter(u => u.role === 'cliente')

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionStatsRow}>
        <div className={styles.statCard}><span className={styles.statCardLabel}>Total</span><span className={styles.statCardValue}>{clients.length}</span></div>
        <div className={styles.statCard}><span className={styles.statCardLabel}>Ativos</span><span className={styles.statCardValue}>—</span></div>
      </div>
      {selectedClient ? (
        <div className={styles.tableCard}>
          <button className={styles.backLink} onClick={() => setSelectedClient(null)}>← Voltar para lista</button>
          <div className={styles.userProfile}>
            <div className={styles.userAvatarLarge}>{selectedClient.name.charAt(0).toUpperCase()}</div>
            <h3 className={styles.userName}>{selectedClient.name}</h3>
            <span className={styles.userEmail}>{selectedClient.email}</span>
            {selectedClient.phone && <span className={styles.userPhone}>{selectedClient.phone}</span>}
            <div className={styles.userMeta}>Papel: {selectedClient.role}</div>
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <h3 className={styles.tableCardTitle}>Todos os Clientes</h3>
            <input className={styles.searchInput} type="text" placeholder="Buscar cliente..." />
          </div>
          <div className={styles.profTable}>
            <div className={styles.profTableHeader}><span>Nome</span><span>Email</span><span>Telefone</span><span>Ações</span></div>
            {clients.length === 0 ? (
              <p className={styles.emptyText}>Nenhum cliente encontrado.</p>
            ) : clients.map((u) => (
              <div key={u.id} className={styles.profTableRow}>
                <span>{u.name}</span><span>{u.email}</span><span>{u.phone ?? '—'}</span>
                <div><button className={styles.viewBtn} onClick={() => setSelectedClient(u)}>Ver perfil</button></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
