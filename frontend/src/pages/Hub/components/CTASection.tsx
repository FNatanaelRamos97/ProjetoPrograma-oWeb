import { useNavigate } from 'react-router-dom'
import styles from './CTASection.module.css'

export default function CTASection() {
  const navigate = useNavigate()

  return (
    <aside className={styles.card}>
      <div className={styles.iconWrapper}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 14l2 2 4-4" />
        </svg>
      </div>
      <h3 className={styles.title}>Precisa de algo específico?</h3>
      <p className={styles.desc}>
        Publique sua solicitação e receba orçamentos de profissionais qualificados.
      </p>
      <button className={styles.btn} onClick={() => navigate('/explorar')}>
        Explorar
      </button>
    </aside>
  )
}
