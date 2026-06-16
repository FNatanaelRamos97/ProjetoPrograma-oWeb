import { useState } from 'react'
import type { ProviderRequest } from '../../../types'
import styles from './Sections.module.css'

interface Props {
  providerRequests: ProviderRequest[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

export default function PedidosSection({ providerRequests, onApprove, onReject }: Props) {
  const [requestFilter, setRequestFilter] = useState('todos')
  const [requestSearch, setRequestSearch] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<ProviderRequest | null>(null)

  const filtered = providerRequests
    .filter(r => requestFilter === 'todos' || r.status === requestFilter)
    .filter(r => !requestSearch || r.userName.toLowerCase().includes(requestSearch.toLowerCase()) || r.userEmail.toLowerCase().includes(requestSearch.toLowerCase()))

  return (
    <div className={styles.sectionContent}>
      <div className={styles.tableCard}>
        <div className={styles.providerRequestHeader}>
          <h3 className={styles.tableCardTitle}>Solicitações de Credenciamento</h3>
          <div className={styles.filterRow}>
            <div className={styles.filterTabs}>
              {['todos', 'pendente', 'aprovado', 'recusado'].map(f => (
                <button key={f} className={`${styles.filterTab} ${requestFilter === f ? styles.filterTabActive : ''}`}
                  onClick={() => setRequestFilter(f)}>
                  {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <input className={styles.searchInput} type="text" placeholder="Buscar por nome ou email..."
              value={requestSearch} onChange={e => setRequestSearch(e.target.value)} />
          </div>
        </div>
        {selectedRequest ? (
          <div className={styles.requestDetail}>
            <button className={styles.backLink} onClick={() => setSelectedRequest(null)}>← Voltar para lista</button>
            <div className={styles.detailCard}>
              <div className={styles.detailAvatar}>{selectedRequest.userName.charAt(0).toUpperCase()}</div>
              <h4 className={styles.detailName}>{selectedRequest.userName}</h4>
              <span className={styles.detailEmail}>{selectedRequest.userEmail}</span>
              <span className={`${styles.requestBadge} ${selectedRequest.status === 'aprovado' ? styles.badgeApproved : selectedRequest.status === 'recusado' ? styles.badgeRejected : styles.badgePending}`}>
                {selectedRequest.status === 'aprovado' ? '✓ Aprovado' : selectedRequest.status === 'recusado' ? '✕ Recusado' : '⏳ Pendente'}
              </span>
              {selectedRequest.message && (
                <div className={styles.detailMsg}><strong>Mensagem:</strong><p>{selectedRequest.message}</p></div>
              )}
              <div className={styles.detailDate}>Solicitação enviada em {new Date(selectedRequest.createdAt).toLocaleDateString('pt-BR')}</div>
              {selectedRequest.status === 'pendente' && (
                <div className={styles.detailActions}>
                  <button className={styles.approveBtn} onClick={() => onApprove(selectedRequest.id)}>✓ Aprovar</button>
                  <button className={styles.rejectBtn} onClick={() => onReject(selectedRequest.id)}>✕ Recusar</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.statsRow}>
              <div className={styles.statBox}><span className={styles.statValue}>{providerRequests.filter(r => r.status === 'pendente').length}</span><span className={styles.statLabel}>Pendentes</span></div>
              <div className={styles.statBox}><span className={styles.statValue}>{providerRequests.filter(r => r.status === 'aprovado').length}</span><span className={styles.statLabel}>Aprovados</span></div>
              <div className={styles.statBox}><span className={styles.statValue}>{providerRequests.filter(r => r.status === 'recusado').length}</span><span className={styles.statLabel}>Recusados</span></div>
            </div>
            <div className={styles.profTable}>
              <div className={styles.profTableHeader}>
                <span>Prestador</span><span>Mensagem</span><span>Data</span><span>Status</span><span>Ações</span>
              </div>
              {filtered.length === 0 ? (
                <p className={styles.emptyText}>Nenhuma solicitação encontrada.</p>
              ) : filtered.map((request) => (
                <div key={request.id} className={styles.profTableRow}>
                  <div><span className={styles.requestName}>{request.userName}</span><span className={styles.requestEmail}>{request.userEmail}</span></div>
                  <span className={styles.requestMsgPreview}>{request.message ? `"${request.message.slice(0, 30)}..."` : '—'}</span>
                  <span className={styles.dateCell}>{new Date(request.createdAt).toLocaleDateString('pt-BR')}</span>
                  <span><span className={`${styles.requestBadge} ${request.status === 'aprovado' ? styles.badgeApproved : request.status === 'recusado' ? styles.badgeRejected : styles.badgePending}`}>
                    {request.status === 'aprovado' ? '✓ Aprovado' : request.status === 'recusado' ? '✕ Recusado' : '⏳ Pendente'}
                  </span></span>
                  <div className={styles.requestActions}>
                    <button className={styles.viewBtn} onClick={() => setSelectedRequest(request)}>Detalhes</button>
                    {request.status === 'pendente' && (
                      <><button className={styles.approveBtn} onClick={() => onApprove(request.id)}>Aprovar</button><button className={styles.rejectBtn} onClick={() => onReject(request.id)}>Recusar</button></>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
