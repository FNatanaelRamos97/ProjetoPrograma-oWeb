import { useNavigate, useLocation } from 'react-router-dom'
import { Check, ShieldCheck, MessageCircle, Home, Clock } from 'lucide-react'
import NavBar from '../../components/NavBar/NavBar'
import styles from './PagamentoRealizado.module.css'

export default function PagamentoRealizado() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { providerName?: string; serviceName?: string; value?: string } | null

  const providerName = state?.providerName ?? 'João Prestador'
  const serviceName = state?.serviceName ?? 'Consultoria Técnica'
  const value = state?.value ?? 'R$ 89,90'

  const today = new Date()
  const formattedDate = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).replace(/ de /g, ' ')

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Success icon */}
          <div className={styles.successIcon}>
            <Check size={28} className={styles.checkIcon} />
          </div>

          {/* Title */}
          <h1 className={styles.title}>Pagamento realizado com sucesso</h1>

          {/* Subtitle */}
          <p className={styles.subtitle}>
            Seu pagamento foi confirmado e o prestador já pode iniciar o atendimento.
          </p>

          {/* Info card */}
          <div className={styles.infoCard}>
            <ShieldCheck size={18} className={styles.infoIcon} />
            <p className={styles.infoText}>Pagamento protegido e processado com segurança.</p>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.chatBtn} onClick={() => navigate('/chat', { state: { providerName } })}>
              <MessageCircle size={20} />
              Falar com {providerName}
            </button>
            <button className={styles.homeBtn} onClick={() => navigate('/hub')}>
              <Home size={20} />
              Voltar ao início
            </button>
          </div>

          {/* Details card */}
          <div className={styles.detailsCard}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Serviço</span>
              <span className={styles.detailValue}>{serviceName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Pagamento</span>
              <span className={styles.detailValue}>PIX</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Valor</span>
              <span className={styles.detailValue}>{value}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Data</span>
              <span className={styles.detailValue}>{formattedDate}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <span className={`${styles.timelineDot} ${styles.timelineDotDone}`} />
              <span className={`${styles.timelineText} ${styles.timelineTextDone}`}>Pagamento confirmado</span>
            </div>
            <div className={styles.timelineItem}>
              <span className={`${styles.timelineDot} ${styles.timelineDotDone}`} />
              <span className={`${styles.timelineText} ${styles.timelineTextDone}`}>Prestador notificado</span>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineDot} />
              <span className={styles.timelineText}>Atendimento em preparação</span>
              <Clock size={12} className={styles.timelinePendingIcon} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
