import { useEffect, useState } from 'react'
import type { FeaturedProvider } from '@db/database'
import { listFeaturedProviders } from '@db/database'
import styles from './ProfessionalsSection.module.css'

function Stars({ count }: { count: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.floor(count) ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </span>
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProfessionalsSection() {
  const [professionals, setProfessionals] = useState<FeaturedProvider[]>([])

  useEffect(() => {
    listFeaturedProviders().then(setProfessionals)
  }, [])

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Profissionais em destaque</h2>
      <div className={styles.grid}>
        {professionals.map((pro, i) => (
          <div key={pro.id} className={styles.card} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={styles.cardTop}>
              <div className={styles.avatarWrapper}>
                {pro.profileImageUrl ? (
                  <img src={pro.profileImageUrl} alt={pro.name} className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatar}>{getInitials(pro.name)}</div>
                )}
              </div>
              <span className={styles.verifiedBadge}>✓ Verificado</span>
            </div>
            <h3 className={styles.proName}>{pro.name}</h3>
            <span className={styles.specialty}>{pro.specialty || 'Profissional'}</span>
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
