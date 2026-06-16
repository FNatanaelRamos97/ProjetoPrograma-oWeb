import { useNavigate } from 'react-router-dom'
import { Shield, Heart, Star, Headset, ChevronRight } from 'lucide-react'
import NavBar from '../../components/NavBar/NavBar'
import styles from './SobreConectServ.module.css'

const pilares = [
  { icon: Shield, title: 'Segurança', desc: 'Todos os profissionais passam por verificação para garantir sua tranquilidade.' },
  { icon: Heart, title: 'Confiança', desc: 'Avaliações reais de clientes ajudam você a escolher o melhor prestador.' },
  { icon: Star, title: 'Qualidade', desc: 'Trabalhamos apenas com profissionais comprometidos com a excelência.' },
  { icon: Headset, title: 'Suporte', desc: 'Equipe dedicada pronta para ajudar antes, durante e após o serviço.' },
]

const timeline = [
  { num: '01', title: 'Como tudo começou', text: 'A ConectServ nasceu da necessidade de conectar pessoas a profissionais de confiança de forma simples e segura. Identificamos que muitas pessoas enfrentavam dificuldades para encontrar prestadores de serviços qualificados próximos a elas.' },
  { num: '02', title: 'Crescimento da plataforma', text: 'Com o crescimento da comunidade, expandimos nossas categorias de serviços e implementamos melhorias contínuas na plataforma, sempre ouvindo o feedback dos nossos usuários.' },
  { num: '03', title: 'O futuro da ConectServ', text: 'Seguimos evoluindo para oferecer cada vez mais recursos, segurança e praticidade. Nosso objetivo é ser a principal referência em contratação de serviços no Brasil.' },
]

export default function SobreConectServ() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />
      <div className={styles.bgGlow3} />
      <NavBar />
      <div className={styles.container}>
        <div className={styles.mainPanel}>
          {/* Hero */}
          <div className={styles.heroSection}>
            <div className={styles.heroLeft}>
              <span className={styles.badge}>Sobre a ConectServ</span>
              <h1 className={styles.heroTitle}>
                Conectando clientes e profissionais com segurança.
              </h1>
              <p className={styles.heroDesc}>
                Uma plataforma moderna para contratação de serviços com praticidade, confiança e transparência.
              </p>
              <div className={styles.heroActions}>
                <button className={styles.btnPrimary} onClick={() => navigate('/explorar')}>
                  Explorar serviços
                </button>
                <button className={styles.btnOutline}>
                  Como funciona
                </button>
              </div>
            </div>
            <div className={styles.heroRight}>
              <div className={styles.cardInstitutional}>
                <h3 className={styles.cardInstTitle}>Nossa missão</h3>
                <p className={styles.cardInstText}>
                  Democratizar o acesso a serviços de qualidade, conectando clientes a profissionais
                  verificados de forma rápida, segura e transparente.
                </p>
                <div className={styles.heroStats}>
                  <div className={styles.heroStatItem}>
                    <span className={styles.heroStatValue}>+12 mil</span>
                    <span className={styles.heroStatLabel}>serviços realizados</span>
                  </div>
                  <div className={styles.heroStatItem}>
                    <span className={styles.heroStatValue}>+3 mil</span>
                    <span className={styles.heroStatLabel}>profissionais ativos</span>
                  </div>
                  <div className={styles.heroStatItem}>
                    <span className={styles.heroStatValue}>97%</span>
                    <span className={styles.heroStatLabel}>avaliações positivas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nossa história */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Nossa história</h2>
              <p className={styles.sectionSub}>Como a ConectServ nasceu e evoluiu ao longo do tempo.</p>
            </div>
            <div className={styles.timeline}>
              {timeline.map((item, i) => (
                <div key={item.num} className={styles.timelineItem}>
                  <div className={styles.timelineDot}>
                    <span className={styles.timelineNum}>{item.num}</span>
                    {i < timeline.length - 1 && <div className={styles.timelineLine} />}
                  </div>
                  <div className={styles.timelineCard}>
                    <h4 className={styles.timelineTitle}>{item.title}</h4>
                    <p className={styles.timelineText}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nossos pilares */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Nossos pilares</h2>
              <p className={styles.sectionSub}>Os valores que guiam cada interação na plataforma.</p>
            </div>
            <div className={styles.pilaresGrid}>
              {pilares.map(p => {
                const Icon = p.icon
                return (
                  <div key={p.title} className={styles.pilarCard}>
                    <Icon size={22} className={styles.pilarIcon} />
                    <h4 className={styles.pilarTitle}>{p.title}</h4>
                    <p className={styles.pilarDesc}>{p.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <div className={styles.ctaSection}>
            <div className={styles.ctaContent}>
              <h3 className={styles.ctaTitle}>Precisa de um profissional?</h3>
              <p className={styles.ctaText}>Explore milhares de serviços disponíveis na plataforma.</p>
            </div>
            <button className={styles.btnPrimary} onClick={() => navigate('/explorar')}>
              Explorar serviços <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
