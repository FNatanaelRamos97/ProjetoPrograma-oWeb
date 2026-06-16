import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ShieldCheck, LoaderCircle, CheckCircle, ArrowRight, Info, QrCode
} from 'lucide-react'
import NavBar from '../../components/NavBar/NavBar'
import styles from './PicPay.module.css'

export default function PicPay() {
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
    navigate('/pagamento-realizado', { state: { ...state, paymentMethod: 'PicPay' } })
  }, [navigate, state])

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.headerIcon}>
            <span className={styles.picpayLogo}>P</span>
          </div>
          <h1 className={styles.title}>Pagamento via PicPay</h1>
          <p className={styles.subtitle}>
            Você será redirecionado para o ambiente seguro do PicPay para concluir o pagamento.
          </p>

          {!redirected ? (
            <>
              <div className={styles.qrSection}>
                <div className={styles.qrCode}>
                  <QrCode size={64} className={styles.qrIcon} />
                </div>
                <p className={styles.qrHint}>Escaneie com o app PicPay</p>
              </div>

              <button
                className={styles.redirectBtn}
                onClick={handleRedirect}
                disabled={loading}
              >
                {loading ? (
                  <><LoaderCircle size={18} className={styles.spinner} /> Processando...</>
                ) : (
                  <><ArrowRight size={20} /> Pagar com PicPay</>
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
