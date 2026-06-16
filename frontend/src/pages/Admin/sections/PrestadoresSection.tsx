import { useState } from 'react'
import type { Service, User } from '../../../types'
import styles from './Sections.module.css'

interface Props {
  users: User[]
  services: Service[]
}

export default function PrestadoresSection({ users, services }: Props) {
  const [selectedProvider, setSelectedProvider] = useState<User | null>(null)
  const providers = users.filter(u => u.role === 'prestador')

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionStatsRow}>
        <div className={styles.statCard}><span className={styles.statCardLabel}>Total</span><span className={styles.statCardValue}>{providers.length}</span></div>
        <div className={styles.statCard}><span className={styles.statCardLabel}>Ativos</span><span className={styles.statCardValue}>—</span></div>
      </div>
      {selectedProvider ? (
        <div className={styles.tableCard}>
          <button className={styles.backLink} onClick={() => setSelectedProvider(null)}>← Voltar para lista</button>
          <div className={styles.userProfile}>
            <div className={styles.userAvatarLarge}>{selectedProvider.name.charAt(0).toUpperCase()}</div>
            <h3 className={styles.userName}>{selectedProvider.name}</h3>
            <span className={styles.userEmail}>{selectedProvider.email}</span>
            {selectedProvider.phone && <span className={styles.userPhone}>{selectedProvider.phone}</span>}
            <div className={styles.userMeta}>Serviços: {services.filter(s => s.provider_id === selectedProvider.id).length}</div>
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <h3 className={styles.tableCardTitle}>Todos os Prestadores</h3>
            <input className={styles.searchInput} type="text" placeholder="Buscar prestador..." />
          </div>
          <div className={styles.profTable}>
            <div className={styles.profTableHeader}><span>Nome</span><span>Email</span><span>Telefone</span><span>Serviços</span><span>Ações</span></div>
            {providers.length === 0 ? (
              <p className={styles.emptyText}>Nenhum prestador encontrado.</p>
            ) : providers.map((u) => (
              <div key={u.id} className={styles.profTableRow}>
                <span>{u.name}</span><span>{u.email}</span><span>{u.phone ?? '—'}</span>
                <span>{services.filter(s => s.provider_id === u.id).length}</span>
                <div><button className={styles.viewBtn} onClick={() => setSelectedProvider(u)}>Ver perfil</button></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
