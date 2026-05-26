import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './HeroSection.module.css'

const benefits = [
  { icon: '✓', label: 'Profissionais verificados' },
  { icon: '🔒', label: 'Pagamento seguro' },
  { icon: '★', label: 'Avaliações reais' },
  { icon: '⚡', label: 'Suporte rápido' },
]

export default function HeroSection() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const term = query.trim()
    if (term) {
      navigate(`/explorar?q=${encodeURIComponent(term)}`)
    } else {
      navigate('/explorar')
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div className={styles.textCol}>
          <h1 className={styles.title}>
            Encontre os melhores serviços para o seu dia a dia
          </h1>
          <p className={styles.subtitle}>
            Conectamos você aos melhores profissionais com segurança, qualidade e praticidade.
          </p>

          <form className={styles.searchRow} onSubmit={handleSearch}>
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="O que você precisa hoje?"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <button className={styles.searchBtn} type="submit">
              Buscar serviços
            </button>
          </form>

          <div className={styles.benefitsRow}>
            {benefits.map((b, i) => (
              <span key={i} className={styles.benefitItem}>
                <span className={styles.benefitIcon}>{b.icon}</span>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.illustrationCol}>
          <div className={styles.illustrationBg} />
          <svg className={styles.illustrationSvg} viewBox="0 0 320 300" fill="none">
            {/* Chair */}
            <g className={styles.floatEl1}>
              <rect x="100" y="170" width="120" height="80" rx="8" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
              <rect x="90" y="170" width="10" height="60" rx="3" fill="rgba(255,255,255,0.15)" />
              <rect x="220" y="170" width="10" height="60" rx="3" fill="rgba(255,255,255,0.15)" />
              <rect x="105" y="140" width="110" height="34" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            </g>
            {/* Plant */}
            <g className={styles.floatEl2}>
              <rect x="240" y="190" width="12" height="50" rx="4" fill="rgba(255,255,255,0.1)" />
              <circle cx="246" cy="180" r="18" fill="rgba(59,130,246,0.15)" />
              <circle cx="246" cy="180" r="12" fill="rgba(59,130,246,0.25)" />
              <circle cx="238" cy="172" r="8" fill="rgba(59,130,246,0.2)" />
              <circle cx="254" cy="174" r="7" fill="rgba(59,130,246,0.2)" />
            </g>
            {/* Lamp */}
            <g className={styles.floatEl3}>
              <line x1="60" y1="100" x2="60" y2="200" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" />
              <path d="M40 100 Q60 80 80 100" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" />
              <circle cx="60" cy="98" r="3" fill="rgba(59,130,246,0.4)" />
            </g>
            {/* Floating particles */}
            <circle cx="280" cy="60" r="4" fill="rgba(59,130,246,0.3)" className={styles.floatParticle} />
            <circle cx="40" cy="50" r="3" fill="rgba(59,130,246,0.2)" className={styles.floatParticle} style={{ animationDelay: '1s' }} />
            <circle cx="170" cy="30" r="5" fill="rgba(59,130,246,0.15)" className={styles.floatParticle} style={{ animationDelay: '0.5s' }} />
            <circle cx="300" cy="140" r="3" fill="rgba(59,130,246,0.2)" className={styles.floatParticle} style={{ animationDelay: '1.5s' }} />
          </svg>
        </div>
      </div>
    </section>
  )
}
