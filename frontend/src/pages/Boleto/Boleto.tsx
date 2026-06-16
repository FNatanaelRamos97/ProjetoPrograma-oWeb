import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ShieldCheck, LoaderCircle, CheckCircle, Copy, Check, Download, Info, Calendar
} from 'lucide-react'
import NavBar from '../../components/NavBar/NavBar'
import styles from './Boleto.module.css'

const BARCODE = '00190.00009 01234.567890 12345.678901 1 98765432101234'
const EXPIRATION = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

export default function Boleto() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as Record<string, unknown> | null

  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(BARCODE.replace(/\s/g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* fallback */ }
  }, [])

  const handleDownload = useCallback(() => {
    const link = document.createElement('a')
    link.href = '#'
    link.download = 'boleto_conectserv.pdf'
    link.click()
  }, [])

  const handlePay = useCallback(async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    navigate('/pagamento-realizado', { state: { ...state, paymentMethod: 'Boleto' } })
  }, [navigate, state])

  const expiryFormatted = EXPIRATION.toLocaleDateString('pt-BR')

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.headerIcon}>
            <span className={styles.boletoLetter}>B</span>
          </div>
          <h1 className={styles.title}>Boleto Bancário</h1>
          <p className={styles.subtitle}>
            Gere o boleto para pagamento. A compensação ocorre em até 3 dias úteis.
          </p>

          {/* Barcode display */}
          <div className={styles.barcodeBox}>
            <div className={styles.barcodeLines}>
              {Array.from({ length: 40 }, (_, i) => (
                <span key={i} className={styles.barcodeBar}
                  style={{ height: `${30 + Math.random() * 40}px`, width: `${1 + Math.random() * 2}px` }}
                />
              ))}
            </div>
            <span className={styles.barcodeNumber}>{BARCODE}</span>
          </div>

          {/* Expiration */}
          <div className={styles.expiryRow}>
            <Calendar size={16} />
            <span>Vencimento: <strong>{expiryFormatted}</strong></span>
          </div>

          {/* Actions */}
          <div className={styles.actionsRow}>
            <button className={styles.copyBtn} onClick={handleCopy}>
              {copied ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Copiar código</>}
            </button>
            <button className={styles.downloadBtn} onClick={handleDownload}>
              <Download size={15} /> Download PDF
            </button>
          </div>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>APÓS PAGAR</span>
            <span className={styles.dividerLine} />
          </div>

          <button className={styles.payBtn} onClick={handlePay} disabled={loading}>
            {loading ? (
              <><LoaderCircle size={18} className={styles.spinner} /> Verificando...</>
            ) : (
              <><CheckCircle size={20} /> Já paguei o boleto</>
            )}
          </button>

          <div className={styles.infoCard}>
            <Info size={18} className={styles.infoIcon} />
            <p className={styles.infoText}>
              O pagamento será confirmado após a compensação bancária. O serviço será liberado automaticamente.
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
