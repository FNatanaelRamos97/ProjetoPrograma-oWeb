import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, SlidersHorizontal, CalendarDays, CreditCard,
  CheckCircle, Clock, XCircle, ChevronRight, ChevronLeft,
  Package, X, MapPin, User, FileText, ShieldCheck, MessageCircle,
} from 'lucide-react'
import NavBar from '../../components/NavBar/NavBar'
import styles from './MeusPedidos.module.css'

type OrderStatus = 'completed' | 'in-progress' | 'cancelled'
type TabValue = 'all' | OrderStatus

interface Order {
  id: number
  title: string
  orderNumber: string
  provider: string
  date: string
  method: string
  status: OrderStatus
  value: string
  valueNum: number
  description: string
  address: string
}

const mockOrders: Order[] = [
  { id: 1, title: 'Criação de mapa mental', orderNumber: 'CON-001', provider: 'Ana Silva', date: '15/05/2026', method: 'PIX', status: 'completed', value: 'R$ 149,90', valueNum: 149.9, description: 'Criação de mapa mental detalhado para planejamento estratégico do projeto.', address: 'Rua das Flores, 123 - Centro' },
  { id: 2, title: 'Limpeza residencial', orderNumber: 'CON-002', provider: 'Carlos Oliveira', date: '18/05/2026', method: 'Cartão', status: 'in-progress', value: 'R$ 89,90', valueNum: 89.9, description: 'Limpeza completa de apartamento 2 quartos, incluindo cozinha e banheiros.', address: 'Av. Principal, 456 - Jardins' },
  { id: 3, title: 'Instalação de chuveiro', orderNumber: 'CON-003', provider: 'João Prestador', date: '12/05/2026', method: 'PIX', status: 'cancelled', value: 'R$ 220,00', valueNum: 220, description: 'Instalação de chuveiro elétrico com substituição do modelo antigo.', address: 'Rua do Comércio, 789 - Centro' },
  { id: 4, title: 'Pintura de parede', orderNumber: 'CON-004', provider: 'Mariana Costa', date: '20/05/2026', method: 'PIX', status: 'completed', value: 'R$ 450,00', valueNum: 450, description: 'Pintura de parede da sala com tinta acrílica premium, cor personalizada.', address: 'Rua dos Artistas, 321 - Vila Nova' },
  { id: 5, title: 'Conserto de torneira', orderNumber: 'CON-005', provider: 'Carlos Oliveira', date: '22/05/2026', method: 'Cartão', status: 'in-progress', value: 'R$ 65,00', valueNum: 65, description: 'Conserto de torneira da pia da cozinha com vazamento no registro.', address: 'Av. Principal, 456 - Jardins' },
  { id: 6, title: 'Montagem de móveis', orderNumber: 'CON-006', provider: 'Ana Silva', date: '10/05/2026', method: 'PIX', status: 'completed', value: 'R$ 180,00', valueNum: 180, description: 'Montagem de estante industrial e mesa de escritório.', address: 'Rua das Flores, 123 - Centro' },
  { id: 7, title: 'Revisão elétrica', orderNumber: 'CON-007', provider: 'João Prestador', date: '25/04/2026', method: 'PIX', status: 'completed', value: 'R$ 310,00', valueNum: 310, description: 'Revisão completa da instalação elétrica residencial.', address: 'Rua do Comércio, 789 - Centro' },
  { id: 8, title: 'Dedetização', orderNumber: 'CON-008', provider: 'Mariana Costa', date: '05/05/2026', method: 'Cartão', status: 'cancelled', value: 'R$ 150,00', valueNum: 150, description: 'Dedetização de apartamento contra pragas urbanas.', address: 'Rua dos Artistas, 321 - Vila Nova' },
]

export default function MeusPedidos() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const itemsPerPage = 5

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => {
    let result = mockOrders
    if (activeTab !== 'all') {
      result = result.filter(o => o.status === activeTab)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.provider.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q)
      )
    }
    return result
  }, [activeTab, search])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  const analytics = useMemo(() => {
    const total = mockOrders.length
    const totalSpent = mockOrders.reduce((acc, o) => acc + o.valueNum, 0)
    const inProgress = mockOrders.filter(o => o.status === 'in-progress').length
    return { total, totalSpent, inProgress }
  }, [])

  const openModal = (order: Order) => {
    setSelectedOrder(order)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setTimeout(() => setSelectedOrder(null), 200)
  }

  const statusConfig: Record<OrderStatus, { label: string; icon: typeof CheckCircle; class: string }> = {
    completed: { label: 'Concluído', icon: CheckCircle, class: styles.badgeCompleted },
    'in-progress': { label: 'Em andamento', icon: Clock, class: styles.badgeInProgress },
    cancelled: { label: 'Cancelado', icon: XCircle, class: styles.badgeCancelled },
  }

  const tabLabel: Record<TabValue, string> = {
    all: 'Todos',
    completed: 'Concluídos',
    'in-progress': 'Em andamento',
    cancelled: 'Cancelados',
  }

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.mainPanel}>
          {/* Header */}
          <div className={styles.topSection}>
            <div className={styles.topLeft}>
              <h1 className={styles.pageTitle}>Meus Pedidos</h1>
              <p className={styles.pageSub}>Acompanhe todos os serviços que você contratou.</p>
            </div>
            <div className={styles.topRight}>
              <div className={styles.searchWrapper}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Buscar pedido ou serviço..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                />
              </div>
              <button className={styles.filterBtn}>
                <SlidersHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Analytics */}
          <div className={styles.analyticsRow}>
            <div className={styles.analyticsCard}>
              <span className={styles.analyticsValue}>{analytics.total}</span>
              <span className={styles.analyticsLabel}>Total de pedidos</span>
            </div>
            <div className={styles.analyticsCard}>
              <span className={styles.analyticsValue}>
                R$ {analytics.totalSpent.toFixed(0)}
              </span>
              <span className={styles.analyticsLabel}>Total gasto</span>
            </div>
            <div className={styles.analyticsCard}>
              <span className={styles.analyticsValue}>{analytics.inProgress}</span>
              <span className={styles.analyticsLabel}>Em andamento</span>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsRow}>
            {(Object.entries(tabLabel) as [TabValue, string][]).map(([key, label]) => (
              <button
                key={key}
                className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
                onClick={() => { setActiveTab(key); setCurrentPage(1) }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className={styles.skeletonList}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonShimmer} />
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonLines}>
                    <div className={styles.skeletonLine} style={{ width: '40%' }} />
                    <div className={styles.skeletonLine} style={{ width: '60%' }} />
                    <div className={styles.skeletonLine} style={{ width: '25%' }} />
                  </div>
                  <div className={styles.skeletonRight}>
                    <div className={styles.skeletonLine} style={{ width: '70px', height: '20px' }} />
                    <div className={styles.skeletonLine} style={{ width: '50px', height: '28px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <div className={styles.emptyState}>
              <Package size={40} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>Nenhum pedido encontrado</h3>
              <p className={styles.emptyText}>
                {search
                  ? 'Tente alterar sua busca ou limpar os filtros.'
                  : 'Você ainda não contratou nenhum serviço.'}
              </p>
              {!search && (
                <button className={styles.emptyBtn} onClick={() => navigate('/explorar')}>
                  Explorar serviços
                </button>
              )}
            </div>
          ) : (
            /* Order list */
            <div className={styles.orderList}>
              {paginated.map((order, i) => {
                const StatusIcon = statusConfig[order.status].icon
                return (
                  <div
                    key={order.id}
                    className={styles.orderCard}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    {/* Left */}
                    <div className={styles.cardLeft}>
                      <div className={styles.avatar}>
                        {order.provider.charAt(0)}
                      </div>
                      <div className={styles.cardInfo}>
                        <span className={styles.cardTitle}>{order.title}</span>
                        <span className={styles.cardOrderNumber}>{order.orderNumber}</span>
                        <span className={styles.cardProvider}>
                          <User size={12} />
                          {order.provider}
                        </span>
                      </div>
                    </div>

                    {/* Center */}
                    <div className={styles.cardCenter}>
                      <span className={styles.cardInfoRow}>
                        <CalendarDays size={13} />
                        {order.date}
                      </span>
                      <span className={styles.cardInfoRow}>
                        <CreditCard size={13} />
                        {order.method}
                      </span>
                    </div>

                    {/* Right */}
                    <div className={styles.cardRight}>
                      <span className={`${styles.statusBadge} ${statusConfig[order.status].class}`}>
                        <StatusIcon size={12} />
                        {statusConfig[order.status].label}
                      </span>
                      <div className={styles.cardRightBottom}>
                        <span className={`${styles.cardValue} ${order.status === 'cancelled' ? styles.cardValueMuted : ''}`}>
                          {order.value}
                        </span>
                        <button className={styles.viewBtn} onClick={() => openModal(order)}>
                          Ver detalhes <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageArrow}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${currentPage === p ? styles.pageBtnActive : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className={styles.pageArrow}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {modalOpen && selectedOrder && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>
              <X size={18} />
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalAvatar}>
                {selectedOrder.provider.charAt(0)}
              </div>
              <div className={styles.modalHeaderInfo}>
                <h2 className={styles.modalTitle}>{selectedOrder.title}</h2>
                <span className={styles.modalOrderNumber}>{selectedOrder.orderNumber}</span>
              </div>
            </div>

            <div className={styles.modalStatus}>
              {(() => {
                const cfg = statusConfig[selectedOrder.status]
                const Icon = cfg.icon
                return (
                  <span className={`${styles.modalStatusBadge} ${cfg.class}`}>
                    <Icon size={14} />
                    {cfg.label}
                  </span>
                )
              })()}
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>
                  <FileText size={14} /> Detalhes do serviço
                </h4>
                <p className={styles.modalDescription}>{selectedOrder.description}</p>
              </div>

              <div className={styles.modalGrid}>
                <div className={styles.modalGridItem}>
                  <span className={styles.modalGridLabel}>Valor</span>
                  <span className={styles.modalGridValue}>{selectedOrder.value}</span>
                </div>
                <div className={styles.modalGridItem}>
                  <span className={styles.modalGridLabel}>Pagamento</span>
                  <span className={styles.modalGridValue}>{selectedOrder.method}</span>
                </div>
                <div className={styles.modalGridItem}>
                  <span className={styles.modalGridLabel}>Data</span>
                  <span className={styles.modalGridValue}>{selectedOrder.date}</span>
                </div>
                <div className={styles.modalGridItem}>
                  <span className={styles.modalGridLabel}>Prestador</span>
                  <span className={styles.modalGridValue}>{selectedOrder.provider}</span>
                </div>
              </div>

              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>
                  <MapPin size={14} /> Endereço
                </h4>
                <p className={styles.modalDescription}>{selectedOrder.address}</p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalChatBtn} onClick={() => { closeModal(); navigate('/chat', { state: { providerName: selectedOrder.provider } }) }}>
                <MessageCircle size={16} />
                Falar com {selectedOrder.provider.split(' ')[0]}
              </button>
              <button className={styles.modalSecurity}>
                <ShieldCheck size={14} />
                Pedido protegido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
