import styles from './ProfessionalsSection.module.css'

const professionals = [
  { id: 1, name: 'João Silva', specialty: 'Eletricista', rating: 4.8, jobs: 127, online: true, initials: 'JS' },
  { id: 2, name: 'Maria Santos', specialty: 'Diarista', rating: 4.9, jobs: 89, online: true, initials: 'MS' },
  { id: 3, name: 'Carlos Lima', specialty: 'Pedreiro', rating: 4.7, jobs: 204, online: false, initials: 'CL' },
  { id: 4, name: 'Pedro Oliveira', specialty: 'Jardineiro', rating: 5.0, jobs: 56, online: true, initials: 'PO' },
]

function Stars({ count }: { count: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.floor(count) ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </span>
  )
}

export default function ProfessionalsSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Profissionais em destaque</h2>
      <div className={styles.grid}>
        {professionals.map((pro, i) => (
          <div key={pro.id} className={styles.card} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={styles.cardTop}>
              <div className={styles.avatarWrapper}>
                <div className={styles.avatar}>{pro.initials}</div>
                <span className={`${styles.statusDot} ${pro.online ? styles.online : styles.away}`} />
              </div>
              <span className={styles.verifiedBadge}>✓ Verificado</span>
            </div>
            <h3 className={styles.proName}>{pro.name}</h3>
            <span className={styles.specialty}>{pro.specialty}</span>
            <div className={styles.ratingRow}>
              <Stars count={pro.rating} />
              <span className={styles.ratingNum}>{pro.rating}</span>
            </div>
            <span className={styles.jobs}>{pro.jobs} serviços realizados</span>
          </div>
        ))}
      </div>
    </section>
  )
}
