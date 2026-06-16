import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/NavBar/NavBar'
import styles from './CartaoCredito.module.css'

export default function CartaoCredito() {
  const navigate = useNavigate()
  const [cardNumber, setCardNumber] = useState('')
  const [validity, setValidity] = useState('')
  const [cvv, setCvv] = useState('')
  const [holderName, setHolderName] = useState('')
  const [cpf, setCpf] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/pagamento')
  }

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatValidity = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) {
      return digits.slice(0, 2) + '/' + digits.slice(2)
    }
    return digits
  }

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return digits.slice(0, 3) + '.' + digits.slice(3)
    if (digits.length <= 9) return digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6)
    return digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6, 9) + '-' + digits.slice(9)
  }

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.steps}>
          <div className={styles.step}>1. Dados</div>
          <div className={styles.step}>2. Pagamento</div>
          <div className={styles.step}>3. Confirmação</div>
        </div>
        <div className={styles.cardPill}>
          <span className={styles.cardNum}>**** **** **** 0000</span>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldFull}>
            <span className={styles.fieldLabel}>NÚMERO DO CARTÃO</span>
            <input className={styles.inputLarge} placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>VALIDADE</span>
            <input className={styles.input} placeholder="MM/AA" value={validity} onChange={e => setValidity(formatValidity(e.target.value))} />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>CVV</span>
            <input className={styles.input} placeholder="***" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>NOME DO TITULAR</span>
            <input className={styles.input} placeholder="Nome como no cartão" value={holderName} onChange={e => setHolderName(e.target.value)} />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>CPF</span>
            <input className={styles.input} placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} />
          </div>
          <button type="submit" className={styles.submitBtn}>CONCLUIR PAGAMENTO</button>
        </form>
      </div>
    </div>
  )
}
