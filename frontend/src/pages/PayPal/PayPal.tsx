import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ShieldCheck, LoaderCircle, CheckCircle, ArrowRight, Info
} from 'lucide-react'
import NavBar from '../../components/NavBar/NavBar'
import styles from './PayPal.module.css'

export default function PayPal() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as Record<string, unknown> | null

  const [loading, setLoading] = useState(false)
  const [redirected, setRedirected] = useState(false)

  const handleRedirect = useCallback(async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 2500))
    setLoading(false)
    setRedirected(true)
  }, [])

  const handleConfirm = useCallback(() => {
    navigate('/pagamento-realizado', { state: { ...state, paymentMethod: 'PayPal' } })
  }, [navigate, state])

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.headerIcon}>
            <span className={styles.paypalLetter}>P</span>
          </div>
          <h1 className={styles.title}>Pagamento via PayPal</h1>
          <p className={styles.subtitle}>
            Você será redirecionado para o ambiente seguro do PayPal para concluir o pagamento.
          </p>

          {!redirected ? (
            <>
              <div className={styles.paypalBrand}>
                <span className={styles.paypalLogo}>PayPal</span>
                <span className={styles.paypalTag}>100% Seguro</span>
              </div>

              <button
                className={styles.redirectBtn}
                onClick={handleRedirect}
                disabled={loading}
              >
                {loading ? (
                  <><LoaderCircle size={18} className={styles.spinner} /> Redirecionando...</>
                ) : (
                  <><ArrowRight size={20} /> Ir para o PayPal</>
                )}
              </button>
            </>
          ) : (
            <>
              <div className={styles.successBox}>
                <CheckCircle size={32} className={styles.successIcon} />
                <span className={styles.successText}>Pagamento aprovado com sucesso!</span>
              </div>

              <button className={styles.confirmBtn} onClick={handleConfirm}>
                <CheckCircle size={20} /> Confirmar e voltar
              </button>
            </>
          )}

          <div className={styles.infoCard}>
            <Info size={18} className={styles.infoIcon} />
            <p className={styles.infoText}>
              Após a confirmação, o valor será retido em sua carteira até a conclusão do serviço.
            </p>
          </div>

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
