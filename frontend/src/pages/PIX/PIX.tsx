import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  QrCode, Clock, Link2, Copy, Check, Info,
  CheckCircle, ShieldCheck, LoaderCircle,
} from 'lucide-react'
import NavBar from '../../components/NavBar/NavBar'
import styles from './PIX.module.css'

const CHAVE_PIX = '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-426614174000'

export default function PIX() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { providerName?: string; serviceName?: string } | null

  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(1798)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CHAVE_PIX)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
    }
  }, [])

  const handlePay = useCallback(async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setLoading(false)
    navigate('/pagamento-realizado', { state: { ...state, paymentMethod: 'PIX' } })
  }, [navigate, state])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const expired = timeLeft <= 0
  const lowTime = timeLeft > 0 && timeLeft < 300

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.headerIcon}>
            <QrCode size={24} />
          </div>
          <h1 className={styles.title}>Pagamento via PIX</h1>
          <p className={styles.subtitle}>Escaneie o QR Code abaixo para realizar o pagamento.</p>

          {/* QR Code */}
          <div className={styles.qrContainer}>
            <div className={styles.qrCode}>
              <div className={styles.qrGrid} />
              <div className={styles.qrCenter}>
                <QrCode size={32} className={styles.qrCenterIcon} />
              </div>
            </div>
          </div>

          {/* Timer */}
          {expired ? (
            <span className={`${styles.timerBadge} ${styles.timerExpired}`}>
              <Clock size={14} /> Expirado
            </span>
          ) : (
            <span className={`${styles.timerBadge} ${lowTime ? styles.timerLow : ''}`}>
              <Clock size={14} /> Expira em {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          )}

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>OU</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Chave PIX */}
          <div className={styles.pixSection}>
            <label className={styles.pixLabel}>Chave PIX</label>
            <div className={styles.pixRow}>
              <div className={styles.pixInputWrapper}>
                <Link2 size={16} className={styles.pixInputIcon} />
                <input
                  className={styles.pixInput}
                  value={CHAVE_PIX}
                  readOnly
                />
              </div>
              <button
                className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ''}`}
                onClick={handleCopy}
              >
                {copied ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Copiar</>}
              </button>
            </div>
            <p className={styles.pixHint}>Escaneie ou copie a chave PIX para pagar</p>
          </div>

          {/* Info card */}
          <div className={styles.infoCard}>
            <Info size={18} className={styles.infoIcon} />
            <p className={styles.infoText}>
              Após a confirmação do pagamento, seus serviços serão agendados automaticamente.
            </p>
          </div>

          {/* Pay button */}
          <button
            className={styles.payBtn}
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? (
              <><LoaderCircle size={18} className={styles.spinner} /> Verificando pagamento...</>
            ) : (
              <><CheckCircle size={20} /> Já paguei</>
            )}
          </button>

          {/* Security footer */}
          <div className={styles.security}>
            <ShieldCheck size={18} className={styles.securityIcon} />
            <div>
              <strong className={styles.securityTitle}>Ambiente 100% seguro</strong>
              <p className={styles.securityText}>
                Seus dados estão protegidos com criptografia de ponta a ponta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
