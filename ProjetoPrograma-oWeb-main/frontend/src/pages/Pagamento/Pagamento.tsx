import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CreditCard, User, Calendar, Lock, ShieldCheck,
  LoaderCircle, Zap, ChevronDown, Shield,
} from 'lucide-react'
import NavBar from '../../components/NavBar/NavBar'
import styles from './Pagamento.module.css'

const brands = [
  { id: 'visa', label: 'Visa', prefix: '4' },
  { id: 'mc', label: 'MC', prefix: '5' },
  { id: 'amex', label: 'Amex', prefix: '34' },
  { id: 'elo', label: 'Elo', prefix: '636368' },
]

const installments = [
  { value: '1', label: '1x de R$ 89,90 (sem juros)' },
  { value: '2', label: '2x de R$ 44,95 (sem juros)' },
  { value: '3', label: '3x de R$ 29,97 (sem juros)' },
]

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function detectBrand(number: string) {
  const clean = number.replace(/\s/g, '')
  for (const b of brands) {
    if (clean.startsWith(b.prefix)) return b.id
  }
  return null
}

export default function Pagamento() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { providerName?: string; serviceName?: string } | null
  const [cardNumber, setCardNumber] = useState('')
  const [name, setName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit')
  const [installment, setInstallment] = useState('1')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const detectedBrand = detectBrand(cardNumber)

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value))
    setErrors(prev => ({ ...prev, card: false }))
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2)
    setExpiry(val)
    setErrors(prev => ({ ...prev, expiry: false }))
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
    setErrors(prev => ({ ...prev, cvv: false }))
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, boolean> = {}
    if (cardNumber.replace(/\s/g, '').length < 13) newErrors.card = true
    if (!name.trim()) newErrors.name = true
    if (expiry.length < 5) newErrors.expiry = true
    if (cvv.length < 3) newErrors.cvv = true

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    navigate('/pagamento-realizado', { state })
  }, [cardNumber, name, expiry, cvv, navigate, state])

  const handlePix = () => {
    navigate('/pix', { state })
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgCircle1} />
      <div className={styles.bgCircle2} />
      <div className={styles.bgCircle3} />
      <NavBar />
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Left — Form */}
          <div className={styles.leftCol}>
            <div className={styles.header}>
              <div className={styles.headerIcon}>
                <CreditCard size={20} />
              </div>
              <div>
                <h1 className={styles.headerTitle}>Dados de pagamento</h1>
                <p className={styles.headerSub}>Preencha os dados para finalizar sua compra com segurança.</p>
              </div>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              {/* Card number */}
              <div className={styles.field}>
                <label className={styles.label}>Número do cartão</label>
                <div className={`${styles.inputWrapper} ${errors.card ? styles.inputError : ''}`}>
                  <CreditCard size={18} className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    value={cardNumber}
                    onChange={handleCardChange}
                    placeholder="0000 0000 0000 0000"
                    autoComplete="cc-number"
                  />
                </div>
              </div>

              {/* Name */}
              <div className={styles.field}>
                <label className={styles.label}>Nome do titular</label>
                <div className={`${styles.inputWrapper} ${errors.name ? styles.inputError : ''}`}>
                  <User size={18} className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: false })) }}
                    placeholder="Seu nome completo"
                    autoComplete="cc-name"
                  />
                </div>
              </div>

              {/* Expiry + CVV */}
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Data de expiração</label>
                  <div className={`${styles.inputWrapper} ${errors.expiry ? styles.inputError : ''}`}>
                    <Calendar size={18} className={styles.inputIcon} />
                    <input
                      className={styles.input}
                      value={expiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/AA"
                      autoComplete="cc-exp"
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>CVV</label>
                  <div className={`${styles.inputWrapper} ${errors.cvv ? styles.inputError : ''}`}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input
                      className={styles.input}
                      value={cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      autoComplete="cc-csc"
                    />
                  </div>
                </div>
              </div>

              {/* Card Type — Segmented Control */}
              <div className={styles.field}>
                <label className={styles.label}>Tipo de cartão</label>
                <div className={styles.segmented}>
                  <button
                    type="button"
                    className={`${styles.segOption} ${cardType === 'credit' ? styles.segActive : ''}`}
                    onClick={() => setCardType('credit')}
                  >
                    <CreditCard size={15} />
                    Crédito
                  </button>
                  <button
                    type="button"
                    className={`${styles.segOption} ${cardType === 'debit' ? styles.segActive : ''}`}
                    onClick={() => setCardType('debit')}
                  >
                    <CreditCard size={15} />
                    Débito
                  </button>
                </div>
              </div>

              {/* Installments */}
              <div className={styles.field}>
                <label className={styles.label}>Parcelamento</label>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.select}
                    value={installment}
                    onChange={e => setInstallment(e.target.value)}
                  >
                    {installments.map(inst => (
                      <option key={inst.value} value={inst.value}>{inst.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className={styles.selectIcon} />
                </div>
              </div>

              {/* Buttons */}
              <div className={styles.btnRow}>
                <button
                  className={styles.submitBtn}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <><LoaderCircle size={18} className={styles.spinner} /> Processando...</>
                  ) : (
                    <><Shield size={18} /> PAGAR</>
                  )}
                </button>
                <button
                  className={styles.pixBtn}
                  type="button"
                  onClick={handlePix}
                >
                  <Zap size={18} /> Pagar com PIX
                </button>
              </div>
            </form>

            {/* Security card */}
            <div className={styles.securityCard}>
              <ShieldCheck size={22} className={styles.securityIcon} />
              <div>
                <strong className={styles.securityTitle}>Pagamento 100% seguro</strong>
                <p className={styles.securityText}>
                  Seus dados estão protegidos com criptografia de ponta a ponta.
                </p>
              </div>
            </div>
          </div>

          {/* Right — Card preview + summary */}
          <div className={styles.rightCol}>
            {/* Card 3D */}
            <div className={styles.cardPreview}>
              <div className={styles.cardShine} />
              <div className={styles.cardChip} />
              <span className={styles.cardNumber}>
                {cardNumber || '•••• •••• •••• ••••'}
              </span>
              <div className={styles.cardBottom}>
                <div>
                  <span className={styles.cardLabel}>Titular</span>
                  <span className={styles.cardValue}>{name || 'Seu nome'}</span>
                </div>
                <div>
                  <span className={styles.cardLabel}>Validade</span>
                  <span className={styles.cardValue}>{expiry || 'MM/AA'}</span>
                </div>
              </div>
            </div>

            {/* Brands */}
            <div className={styles.brandsRow}>
              {brands.map(b => (
                <span
                  key={b.id}
                  className={`${styles.brand} ${detectedBrand === b.id ? styles.brandActive : ''}`}
                >
                  {b.label}
                </span>
              ))}
            </div>

            {/* Summary */}
            <div className={styles.summary}>
              <h3 className={styles.summaryTitle}>Resumo do Pagamento</h3>
              <div className={styles.summaryRow}>
                <span>Valor da compra</span>
                <span>R$ 89,90</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>R$ 89,90</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
