import { useState } from 'react'
import {
  Search, Headset, CreditCard, User, Wrench,
  Shield, MessageCircle, AlertCircle, ChevronDown,
  Mail, Phone, Clock, HelpCircle,
} from 'lucide-react'
import NavBar from '../../components/NavBar/NavBar'
import styles from './AjudaSuporte.module.css'

type FaqIndex = number | null

const categories = [
  { icon: CreditCard, title: 'Pagamentos', desc: 'Dúvidas sobre cobranças, faturas e métodos de pagamento.' },
  { icon: User, title: 'Conta e perfil', desc: 'Gerenciamento de dados pessoais, senha e preferências.' },
  { icon: Wrench, title: 'Serviços', desc: 'Informações sobre contratação, agendamento e execução.' },
  { icon: Shield, title: 'Segurança', desc: 'Proteção da conta, autenticação e privacidade.' },
  { icon: MessageCircle, title: 'Mensagens', desc: 'Como funciona o chat com prestadores de serviços.' },
  { icon: AlertCircle, title: 'Problemas técnicos', desc: 'Erros no sistema, lentidão ou dificuldades de acesso.' },
]

const faqItems = [
  { q: 'Como contratar um serviço?', a: 'Navegue pelos serviços disponíveis na página Explorar, escolha o que atende sua necessidade e clique em "Solicitar Orçamento". O prestador receberá sua solicitação e vocês poderão combinar os detalhes pelo chat.' },
  { q: 'Como funciona o pagamento via PIX?', a: 'Após solicitar o orçamento, você pode pagar via PIX gerando um QR Code na página de pagamento. O código é válido por 30 minutos e a confirmação é instantânea.' },
  { q: 'Posso cancelar um pedido?', a: 'Sim, você pode cancelar um pedido desde que o serviço ainda não tenha sido iniciado. Basta acessar Meus Pedidos, clicar em "Ver detalhes" e solicitar o cancelamento.' },
  { q: 'Como falar com o profissional?', a: 'Após contratar um serviço, utilize o chat disponível na página do pedido ou acesse a seção Mensagens para conversar diretamente com o prestador.' },
  { q: 'Como alterar meus dados?', a: 'Acesse Configurações → Minha conta. Lá você pode editar nome, e-mail, telefone e outras informações pessoais.' },
  { q: 'Os pagamentos são seguros?', a: 'Sim, todas as transações são processadas com criptografia de ponta a ponta e ambientes seguros. Seus dados financeiros nunca são compartilhados com terceiros.' },
]

const contacts = [
  { icon: MessageCircle, label: 'Chat online', sub: 'Disponível 24 horas' },
  { icon: Mail, label: 'suporte@conectserv.com', sub: 'Respondemos em até 2 horas' },
  { icon: Phone, label: 'WhatsApp', sub: '(11) 99999-9999' },
  { icon: Clock, label: 'Horário de atendimento', sub: 'Seg a Sex, das 8h às 20h' },
]

export default function AjudaSuporte() {
  const [openFaq, setOpenFaq] = useState<FaqIndex>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index))
  }

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
              <span className={styles.badge}>
                <HelpCircle size={12} /> Ajuda e suporte
              </span>
              <h1 className={styles.heroTitle}>Como podemos ajudar você?</h1>
              <p className={styles.heroDesc}>
                Encontre respostas rápidas, tutoriais e suporte para utilizar a plataforma com tranquilidade.
              </p>
              <div className={styles.searchWrapper}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Buscar dúvidas, pedidos ou pagamentos..."
                />
              </div>
            </div>
            <div className={styles.heroRight}>
              <div className={styles.cardHeadset}>
                <div className={styles.headsetIconWrapper}>
                  <Headset size={28} />
                </div>
                <h3 className={styles.headsetTitle}>Suporte humanizado</h3>
                <p className={styles.headsetText}>
                  Nosso suporte está disponível para ajudar você sempre que precisar.
                </p>
                <div className={styles.headsetStats}>
                  <span className={styles.headsetStat}>
                    <Clock size={13} /> Resposta média: <strong>2 horas</strong>
                  </span>
                </div>
                <span className={styles.onlineBadge}>🟢 Atendimento online</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Categorias de ajuda</h2>
              <p className={styles.sectionSub}>
                Escolha um assunto para encontrar a resposta que você precisa.
              </p>
            </div>
            <div className={styles.categoriesGrid}>
              {categories.map(cat => {
                const Icon = cat.icon
                return (
                  <div key={cat.title} className={styles.categoryCard}>
                    <Icon size={22} className={styles.categoryIcon} />
                    <h4 className={styles.categoryTitle}>{cat.title}</h4>
                    <p className={styles.categoryDesc}>{cat.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* FAQ */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Perguntas frequentes</h2>
              <p className={styles.sectionSub}>
                As dúvidas mais comuns dos usuários da plataforma.
              </p>
            </div>
            <div className={styles.faqList}>
              {faqItems.map((item, i) => (
                <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqItemOpen : ''}`}>
                  <button className={styles.faqBtn} onClick={() => toggleFaq(i)}>
                    <span className={styles.faqQuestion}>{item.q}</span>
                    <ChevronDown size={16} className={`${styles.faqChevron} ${openFaq === i ? styles.faqChevronOpen : ''}`} />
                  </button>
                  <div className={`${styles.faqAnswer} ${openFaq === i ? styles.faqAnswerOpen : ''}`}>
                    <p className={styles.faqAnswerText}>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Ainda precisa de ajuda?</h2>
              <p className={styles.sectionSub}>
                Nossa equipe está pronta para atender você.
              </p>
            </div>
            <div className={styles.contactGrid}>
              {contacts.map(ct => {
                const Icon = ct.icon
                return (
                  <div key={ct.label} className={styles.contactItem}>
                    <Icon size={18} className={styles.contactIcon} />
                    <div className={styles.contactInfo}>
                      <span className={styles.contactLabel}>{ct.label}</span>
                      <span className={styles.contactSub}>{ct.sub}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className={styles.bottomCTA}>
            <div className={styles.ctaContent}>
              <h3 className={styles.ctaTitle}>Ainda precisa de ajuda?</h3>
              <p className={styles.ctaText}>Nossa equipe pode ajudar você diretamente.</p>
            </div>
            <button className={styles.ctaBtn}>
              <MessageCircle size={18} /> Enviar mensagem
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
