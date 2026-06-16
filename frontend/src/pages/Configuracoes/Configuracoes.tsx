import { useState, useRef } from 'react'
import {
  User, Shield, Bell, CreditCard, Lock,
  Palette, CircleHelp, ChevronRight, CheckCircle,
  Smartphone, Monitor, Moon, Key, Fingerprint,
  MessageCircle, Package, LoaderCircle,
} from 'lucide-react'
import NavBar from '../../components/NavBar/NavBar'
import { updateUserProfile } from '@db/database'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Configuracoes.module.css'

type Section = 'conta' | 'seguranca' | 'notificacoes' | 'pagamentos' | 'privacidade' | 'aparencia' | 'suporte'

const sections: { id: Section; label: string; icon: typeof User }[] = [
  { id: 'conta', label: 'Minha conta', icon: User },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
  { id: 'privacidade', label: 'Privacidade', icon: Lock },
  { id: 'aparencia', label: 'Aparência', icon: Palette },
  { id: 'suporte', label: 'Suporte', icon: CircleHelp },
]

const sectionTitles: Record<Section, { title: string; sub: string }> = {
  conta: { title: 'Minha conta', sub: 'Gerencie suas informações pessoais e preferências da conta.' },
  seguranca: { title: 'Segurança', sub: 'Proteja sua conta com senha, autenticação e dispositivos confiáveis.' },
  notificacoes: { title: 'Notificações', sub: 'Escolha como e quando receber notificações do ConectServ.' },
  pagamentos: { title: 'Pagamentos', sub: 'Gerencie seus métodos de pagamento e histórico de transações.' },
  privacidade: { title: 'Privacidade', sub: 'Controle quem pode ver suas informações no marketplace.' },
  aparencia: { title: 'Aparência', sub: 'Personalize a aparência da sua interface.' },
  suporte: { title: 'Suporte', sub: 'Precisa de ajuda? Estamos aqui para você.' },
}

function Toggle({ checked }: { checked: boolean }) {
  return <span className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}>
    <span className={styles.toggleKnob} />
  </span>
}

export default function Configuracoes() {
  const [activeSection, setActiveSection] = useState<Section>('conta')
  const { user, token, updateUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSave() {
    if (!token || !user) return
    setSaving(true)
    setSaved(false)
    const formData = new FormData()
    formData.append('name', nameRef.current?.value ?? user.name)
    formData.append('phone', phoneRef.current?.value ?? user.phone ?? '')
    const updated = await updateUserProfile(formData, token)
    if (updated) updateUser(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !token) return
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.')
      return
    }
    setSaving(true)
    const formData = new FormData()
    formData.append('profileImage', file)
    formData.append('name', user!.name)
    const updated = await updateUserProfile(formData, token)
    if (updated) updateUser(updated)
    setSaving(false)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'conta':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Foto do perfil</h3>
              <div className={styles.avatarRow}>
                <div className={styles.bigAvatar} onClick={() => fileInputRef.current?.click()}>
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="" className={styles.bigAvatarImg} />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() ?? "?"
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                <div className={styles.avatarActions}>
                  <button className={styles.avatarBtn} onClick={() => fileInputRef.current?.click()}>{saving ? 'Enviando...' : 'Alterar foto'}</button>
                  <button className={styles.avatarBtnOutline}>Remover</button>
                </div>
              </div>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Informações pessoais</h3>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Nome completo</label>
                  <input className={styles.fieldInput} ref={nameRef} defaultValue={user?.name ?? ""} />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Username</label>
                  <input className={styles.fieldInput} defaultValue={user?.email?.split('@')[0] ?? ""} disabled />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>E-mail</label>
                  <input className={styles.fieldInput} defaultValue={user?.email ?? ""} disabled />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Telefone</label>
                  <input className={styles.fieldInput} ref={phoneRef} defaultValue={user?.phone ?? ""} />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>CPF</label>
                  <input className={styles.fieldInput} defaultValue={user?.identity ?? ""} disabled />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Data de nascimento</label>
                  <input className={styles.fieldInput} defaultValue="15/06/1995" disabled />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? <><LoaderCircle size={16} className={styles.spinner} /> Salvando...</> : 'Salvar alterações'}
              </button>
              {saved && <span style={{ color: '#00b96b', fontSize: 13, fontWeight: 500 }}>✓ Salvo</span>}
            </div>
          </div>
        )

      case 'seguranca':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Key size={18} />
                <h3 className={styles.cardTitle}>Alterar senha</h3>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Senha atual</label>
                  <input className={styles.fieldInput} type="password" defaultValue="●●●●●●●●" />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Nova senha</label>
                  <input className={styles.fieldInput} type="password" />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Confirmar nova senha</label>
                  <input className={styles.fieldInput} type="password" />
                </div>
              </div>
              <button className={styles.saveBtn} style={{ marginTop: 8 }}>Atualizar senha</button>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Fingerprint size={18} />
                <h3 className={styles.cardTitle}>Autenticação de dois fatores</h3>
              </div>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Autenticação em duas etapas</span>
                <Toggle checked />
              </div>
              <p className={styles.cardHint}>Proteção extra com código enviado ao seu celular ou e-mail.</p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Smartphone size={18} />
                <h3 className={styles.cardTitle}>Dispositivos conectados</h3>
              </div>
              <div className={styles.deviceList}>
                <div className={styles.deviceItem}>
                  <Monitor size={16} />
                  <div className={styles.deviceInfo}>
                    <span className={styles.deviceName}>Windows PC - Chrome</span>
                    <span className={styles.deviceTime}>Ativo agora</span>
                  </div>
                  <span className={styles.deviceBadge}>Atual</span>
                </div>
                <div className={styles.deviceItem}>
                  <Smartphone size={16} />
                  <div className={styles.deviceInfo}>
                    <span className={styles.deviceName}>iPhone 15 - Safari</span>
                    <span className={styles.deviceTime}>Último acesso há 2 horas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notificacoes':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Canais de notificação</h3>
              <div className={styles.toggleRow}><span className={styles.toggleLabel}>Notificações por e-mail</span><Toggle checked /></div>
              <div className={styles.toggleRow}><span className={styles.toggleLabel}>Notificações push</span><Toggle checked /></div>
              <div className={styles.toggleRow}><span className={styles.toggleLabel}>Notificações SMS</span><Toggle checked={false} /></div>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Preferências</h3>
              <div className={styles.toggleRow}><span className={styles.toggleLabel}>Promoções e ofertas</span><Toggle checked={false} /></div>
              <div className={styles.toggleRow}><span className={styles.toggleLabel}>Atualizações de pedidos</span><Toggle checked /></div>
              <div className={styles.toggleRow}><span className={styles.toggleLabel}>Mensagens de prestadores</span><Toggle checked /></div>
              <div className={styles.toggleRow}><span className={styles.toggleLabel}>Lembretes de agendamento</span><Toggle checked /></div>
            </div>
          </div>
        )

      case 'pagamentos':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Cartões salvos</h3>
              <div className={styles.paymentMethod}>
                <CreditCard size={18} />
                <div className={styles.paymentInfo}>
                  <span className={styles.paymentName}>Visa final •••• 4242</span>
                  <span className={styles.paymentExpiry}>Vence 12/2027</span>
                </div>
                <CheckCircle size={16} className={styles.paymentCheck} />
              </div>
              <div className={styles.paymentMethod}>
                <CreditCard size={18} />
                <div className={styles.paymentInfo}>
                  <span className={styles.paymentName}>Mastercard final •••• 8888</span>
                  <span className={styles.paymentExpiry}>Vence 08/2026</span>
                </div>
              </div>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>PIX</h3>
              <div className={styles.pixBox}>
                <span className={styles.pixKey}>{user?.email ?? ""}</span>
                <span className={styles.pixBadge}>Principal</span>
              </div>
            </div>
          </div>
        )

      case 'privacidade':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Controles de privacidade</h3>
              <div className={styles.toggleRow}><span className={styles.toggleLabel}>Perfil público</span><Toggle checked /></div>
              <div className={styles.toggleRow}><span className={styles.toggleLabel}>Mostrar avaliações recebidas</span><Toggle checked /></div>
              <div className={styles.toggleRow}><span className={styles.toggleLabel}>Compartilhar número de telefone</span><Toggle checked={false} /></div>
              <div className={styles.toggleRow}><span className={styles.toggleLabel}>Exibir histórico de serviços</span><Toggle checked={false} /></div>
            </div>
          </div>
        )

      case 'aparencia':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Tema</h3>
              <div className={styles.themeRow}>
                <div className={`${styles.themeOption} ${styles.themeOptionActive}`}>
                  <Moon size={20} />
                  <span>Escuro</span>
                </div>
                <div className={styles.themeOption}>
                  <Sun size={20} />
                  <span>Claro</span>
                </div>
                <div className={styles.themeOption}>
                  <Monitor size={20} />
                  <span>Sistema</span>
                </div>
              </div>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Interface</h3>
              <div className={styles.toggleRow}><span className={styles.toggleLabel}>Interface compacta</span><Toggle checked={false} /></div>
              <div className={styles.toggleRow}><span className={styles.toggleLabel}>Animações suaves</span><Toggle checked /></div>
            </div>
          </div>
        )

      case 'suporte':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.supportGrid}>
              <div className={styles.supportCard}>
                <CircleHelp size={24} />
                <h4>Central de ajuda</h4>
                <p>Tire dúvidas sobre como usar o ConectServ.</p>
                <button className={styles.supportBtn}>Acessar</button>
              </div>
              <div className={styles.supportCard}>
                <MessageCircle size={24} />
                <h4>Fale conosco</h4>
                <p>Entre em contato com nossa equipe de suporte.</p>
                <button className={styles.supportBtn}>Enviar mensagem</button>
              </div>
              <div className={styles.supportCard}>
                <Package size={24} />
                <h4>Reportar problema</h4>
                <p>Comunique um erro ou problema técnico.</p>
                <button className={styles.supportBtn}>Reportar</button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />
      <div className={styles.bgGlow3} />
      <NavBar />
      <div className={styles.container}>
        <div className={styles.settingsPanel}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <div className={styles.sidebarAvatar}>
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className={styles.bigAvatarImg} />
              ) : (
                user?.name?.charAt(0).toUpperCase() ?? "?"
              )}
            </div>
              <span className={styles.sidebarName}>{user?.name ?? "Usuário"}</span>
              <span className={styles.sidebarEmail}>{user?.email ?? ""}</span>
              <span className={styles.sidebarBadge}>
                <CheckCircle size={12} /> Conta verificada
              </span>
            </div>
            <nav className={styles.sidebarMenu}>
              {sections.map(sec => {
                const Icon = sec.icon
                return (
                  <button
                    key={sec.id}
                    className={`${styles.menuItem} ${activeSection === sec.id ? styles.menuItemActive : ''}`}
                    onClick={() => setActiveSection(sec.id)}
                  >
                    <Icon size={18} />
                    <span className={styles.menuLabel}>{sec.label}</span>
                    {activeSection === sec.id && <ChevronRight size={14} className={styles.menuArrow} />}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className={styles.contentArea}>
            <div className={styles.contentHeader}>
              <h2 className={styles.contentTitle}>{sectionTitles[activeSection].title}</h2>
              <p className={styles.contentSub}>{sectionTitles[activeSection].sub}</p>
            </div>
            <div key={activeSection} className={styles.contentBody}>
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function Sun(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}
