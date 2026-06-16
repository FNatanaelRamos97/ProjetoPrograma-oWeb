import styles from './FooterBenefits.module.css'

const items = [
  { icon: '🛡️', title: 'Seguro e Confiável', desc: 'Profissionais verificados e com histórico' },
  { icon: '⭐', title: 'Avaliações Reais', desc: 'Feedbacks autênticos de clientes reais' },
  { icon: '💳', title: 'Pagamento Protegido', desc: 'Transações seguras em nossa plataforma' },
  { icon: '💬', title: 'Suporte Dedicado', desc: 'Equipe pronta para ajudar você' },
]

export default function FooterBenefits() {
  return (
    <footer className={styles.bar}>
      <div className={styles.inner}>
        {items.map((item, i) => (
          <div key={i} className={styles.item}>
            <span className={styles.icon}>{item.icon}</span>
            <div className={styles.info}>
              <strong className={styles.title}>{item.title}</strong>
              <span className={styles.desc}>{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </footer>
  )
}
