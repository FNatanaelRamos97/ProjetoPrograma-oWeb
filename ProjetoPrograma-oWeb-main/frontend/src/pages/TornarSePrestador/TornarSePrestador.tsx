import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ShieldCheck, FileText, Check } from 'lucide-react'
import { requestProviderRole } from '@db/database.ts'
import { useAuth } from '../../contexts/AuthContext'
import NavBar from '../../components/NavBar/NavBar'
import styles from './TornarSePrestador.module.css'

const CATEGORIES = [
  'Consultoria', 'Aulas e Cursos', 'Design Gráfico', 'Desenvolvimento Web',
  'Programação e TI', 'Marketing Digital', 'Redes Sociais', 'Edição de Vídeo',
  'Fotografia', 'Música e Áudio', 'Tradução e Conteúdo', 'Assistente Virtual',
  'Suporte Técnico', 'Manutenção e Reparos', 'Limpeza e Organização',
  'Reformas e Construção', 'Jardinagem e Paisagismo', 'Saúde e Bem-Estar',
  'Beleza e Estética', 'Pet Care', 'Eventos e Cerimônias',
  'Transporte e Mudanças', 'Entregas e Frete', 'Advocacia e Jurídico',
  'Finanças e Contabilidade', 'Administração', 'Outra',
]

const EXPERIENCE_OPTIONS = ['Menos de 1 ano', '1 a 3 anos', '3 a 5 anos', '5 a 10 anos', 'Mais de 10 anos']
const YES_NO = ['Sim', 'Não']

const STEPS = [
  { num: 1, label: 'Informações', sub: 'Dados básicos' },
  { num: 2, label: 'Experiência', sub: 'Sua atuação' },
  { num: 3, label: 'Currículo', sub: 'PDF e portfólio' },
  { num: 4, label: 'Revisão', sub: 'Confirmar dados' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <span
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.toggleKnob} />
    </span>
  )
}

export default function TornarSePrestador() {
  const navigate = useNavigate()
  const { user, token, login } = useAuth()

  const [activeStep, setActiveStep] = useState(1)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [experience, setExperience] = useState('')

  // Step 2
  const [experienceText, setExperienceText] = useState('')
  const [differentials, setDifferentials] = useState('')
  const [motivation, setMotivation] = useState('')
  const [relevantClients, setRelevantClients] = useState('')
  const [certifications, setCertifications] = useState('')

  // Step 3
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 4
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handlePdfSelect = (file: File | null) => {
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Apenas arquivos PDF são aceitos.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 5MB.')
      return
    }

    setPdfFile(file)
    setError('')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handlePdfSelect(e.dataTransfer.files[0])
  }

  const handleRemovePdf = () => {
    setPdfFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const validateStep = (step: number): boolean => {
    setError('')

    if (step === 1) {
      if (!category) {
        setError('Selecione uma categoria.')
        return false
      }

      if (!city) {
        setError('Informe sua cidade.')
        return false
      }

      if (!experience) {
        setError('Selecione há quanto tempo atua.')
        return false
      }
    }

    if (step === 2) {
      if (!experienceText.trim()) {
        setError('Conte um pouco sobre sua experiência.')
        return false
      }

      if (!motivation.trim()) {
        setError('Conte por que deseja se tornar prestador.')
        return false
      }
    }

    if (step === 4) {
      if (!termsAccepted) {
        setError('Aceite os termos para continuar.')
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (!validateStep(activeStep)) return
    setActiveStep(prev => Math.min(prev + 1, 4))
  }

  const handleBack = () => {
    if (activeStep === 1) {
      navigate('/hub')
      return
    }

    setActiveStep(prev => prev - 1)
  }

  const buildRequestMessage = () => {
    return [
      `Categoria: ${category}`,
      `Cidade/Estado: ${city}`,
      `Tempo de atuação: ${experience}`,
      `Experiência profissional: ${experienceText}`,
      `Diferenciais: ${differentials || 'Não informado'}`,
      `Motivação: ${motivation}`,
      `Já trabalhou para clientes relevantes?: ${relevantClients || 'Não informado'}`,
      `Certificações ou cursos: ${certifications || 'Não informado'}`,
      `Currículo/portfólio em PDF: ${pdfFile ? pdfFile.name : 'Não enviado'}`
    ].join('\n')
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    if (!user) {
      setError('Faça login para enviar a solicitação.')
      return
    }

    if (!token) {
      setError('Sessão expirada. Faça login novamente.')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      const message = buildRequestMessage()
      const ok = await requestProviderRole(message, token)

      if (!ok) {
        setError('Não foi possível enviar a solicitação. Tente novamente.')
        return
      }

      const updatedUser = {
        ...user,
        role: 'prestador_pendente' as const
      }

      login(updatedUser, token)
      setSubmitted(true)
    } catch {
      setError('Erro ao enviar a solicitação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <NavBar />
        <div className={styles.container}>
          <div className={styles.formCard}>
            <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px 0' }}>
              Faça login para acessar esta página.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (user.role === 'prestador' || user.role === 'admin') {
    return (
      <div className={styles.page}>
        <NavBar />
        <div className={styles.container}>
          <div className={styles.formCard}>
            <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px 0' }}>
              Você já possui acesso de prestador na plataforma.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (user.role === 'prestador_pendente') {
    return (
      <div className={styles.page}>
        <NavBar />
        <div className={styles.container}>
          <div className={styles.formCard}>
            <div className={styles.successOverlay}>
              <div className={styles.successIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 className={styles.successTitle}>Solicitação já enviada</h2>

              <p className={styles.successSub}>
                Sua solicitação para se tornar prestador já foi recebida.<br />
                Nossa equipe fará a análise em breve.
              </p>

              <button className={styles.btnPrimary} onClick={() => navigate('/perfil')}>
                Voltar para o perfil
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <NavBar />
        <div className={styles.container}>
          <div className={styles.formCard}>
            <div className={styles.successOverlay}>
              <div className={styles.successIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 className={styles.successTitle}>Solicitação enviada com sucesso!</h2>

              <p className={styles.successSub}>
                Sua solicitação foi enviada para análise.<br />
                Aguarde a aprovação do administrador.
              </p>

              <button className={styles.btnPrimary} onClick={() => navigate('/perfil')}>
                Voltar para o perfil
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStepIndicator = () => (
    <div className={styles.stepsRow}>
      {STEPS.map((s, idx) => {
        const isActive = activeStep === s.num
        const isComplete = activeStep > s.num
        const isFuture = activeStep < s.num

        return (
          <div className={styles.stepWrapper} key={s.num}>
            <div className={`${styles.step} ${isActive ? styles.stepActive : ''} ${isComplete ? styles.stepComplete : ''} ${isFuture ? styles.stepFuture : ''}`}>
              <span className={styles.stepCircle}>
                {isComplete ? <Check size={16} /> : s.num}
              </span>

              <div className={styles.stepTexts}>
                <span className={styles.stepLabel}>{s.label}</span>
                <span className={styles.stepSub}>{s.sub}</span>
              </div>
            </div>

            {idx < STEPS.length - 1 && (
              <div className={`${styles.stepLine} ${isComplete ? styles.stepLineComplete : isActive ? styles.stepLineActive : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )

  const renderStep1 = () => (
    <div className={styles.formGrid}>
      <div className={styles.field}>
        <label className={styles.label}>
          Qual serviço deseja oferecer?<span className={styles.required}>*</span>
        </label>

        <div className={styles.selectWrapper}>
          <select className={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Selecione</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <ChevronDown className={styles.selectArrow} size={18} />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Cidade/Estado<span className={styles.required}>*</span>
        </label>

        <input
          className={styles.input}
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Ex: São Paulo, SP"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Há quanto tempo atua na área?<span className={styles.required}>*</span>
        </label>

        <div className={styles.selectWrapper}>
          <select className={styles.select} value={experience} onChange={e => setExperience(e.target.value)}>
            <option value="">Selecione</option>
            {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          <ChevronDown className={styles.selectArrow} size={18} />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className={styles.formGrid}>
      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label className={styles.label}>
          Conte um pouco sobre sua experiência profissional<span className={styles.required}>*</span>
        </label>

        <textarea
          className={styles.textarea}
          value={experienceText}
          onChange={e => setExperienceText(e.target.value)}
          placeholder="Descreva sua trajetória profissional, áreas em que trabalhou e principais atividades..."
          rows={4}
        />
      </div>

      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label className={styles.label}>Quais são seus diferenciais?</label>

        <textarea
          className={styles.textarea}
          value={differentials}
          onChange={e => setDifferentials(e.target.value)}
          placeholder="O que faz você se destacar dos demais profissionais?"
          rows={3}
        />
      </div>

      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label className={styles.label}>
          Por que você deseja se tornar um prestador ConectServ?<span className={styles.required}>*</span>
        </label>

        <textarea
          className={styles.textarea}
          value={motivation}
          onChange={e => setMotivation(e.target.value)}
          placeholder="Conte o que motivou seu cadastro na plataforma..."
          rows={3}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Já trabalhou para clientes relevantes?</label>

        <div className={styles.selectWrapper}>
          <select className={styles.select} value={relevantClients} onChange={e => setRelevantClients(e.target.value)}>
            <option value="">Selecione</option>
            {YES_NO.map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          <ChevronDown className={styles.selectArrow} size={18} />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Possui certificações ou cursos?</label>

        <input
          className={styles.input}
          value={certifications}
          onChange={e => setCertifications(e.target.value)}
          placeholder="Ex: Curso de Design, Certificação Google"
        />
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className={styles.formGrid}>
      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label className={styles.label}>Adicione seu currículo ou portfólio</label>

        {pdfFile ? (
          <div className={styles.uploadPreview}>
            <FileText className={styles.uploadPdfPreviewIcon} />

            <div className={styles.uploadInfo}>
              <div className={styles.uploadFileName}>{pdfFile.name}</div>
              <div className={styles.uploadFileSize}>{formatFileSize(pdfFile.size)}</div>
            </div>

            <button type="button" className={styles.removeBtn} onClick={handleRemovePdf}>
              Remover
            </button>
          </div>
        ) : (
          <div
            className={`${styles.uploadArea} ${dragOver ? styles.uploadDragOver : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <FileText className={styles.uploadPdfIcon} />
            <span className={styles.uploadTitle}>Adicione seu currículo ou portfólio em PDF</span>
            <span className={styles.uploadHint}>Arraste o arquivo ou clique para selecionar • PDF até 5MB</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className={styles.uploadHidden}
          onChange={e => handlePdfSelect(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  )

  const renderStep4 = () => (
    <>
      <div className={styles.reviewGrid}>
        <div className={styles.reviewCard}>
          <div className={styles.reviewLabel}>Categoria</div>
          <div className={styles.reviewValue}>{category || '—'}</div>
        </div>

        <div className={styles.reviewCard}>
          <div className={styles.reviewLabel}>Cidade</div>
          <div className={styles.reviewValue}>{city || '—'}</div>
        </div>

        <div className={styles.reviewCard}>
          <div className={styles.reviewLabel}>Tempo de atuação</div>
          <div className={styles.reviewValue}>{experience || '—'}</div>
        </div>

        <div className={`${styles.reviewCard} ${styles.reviewCardFull}`}>
          <div className={styles.reviewLabel}>Experiência</div>
          <div className={styles.reviewValue}>{experienceText || '—'}</div>
        </div>

        {differentials && (
          <div className={`${styles.reviewCard} ${styles.reviewCardFull}`}>
            <div className={styles.reviewLabel}>Diferenciais</div>
            <div className={styles.reviewValue}>{differentials}</div>
          </div>
        )}

        <div className={`${styles.reviewCard} ${styles.reviewCardFull}`}>
          <div className={styles.reviewLabel}>Motivação</div>
          <div className={styles.reviewValue}>{motivation || '—'}</div>
        </div>

        {relevantClients && (
          <div className={styles.reviewCard}>
            <div className={styles.reviewLabel}>Clientes relevantes</div>
            <div className={styles.reviewValue}>{relevantClients}</div>
          </div>
        )}

        {certifications && (
          <div className={styles.reviewCard}>
            <div className={styles.reviewLabel}>Certificações</div>
            <div className={styles.reviewValue}>{certifications}</div>
          </div>
        )}

        <div className={styles.reviewCard}>
          <div className={styles.reviewLabel}>Currículo</div>
          <div className={styles.reviewValue}>{pdfFile ? pdfFile.name : 'Não enviado'}</div>
        </div>
      </div>

      <div className={`${styles.field} ${styles.fieldFull}`}>
        <div className={styles.toggleRow} onClick={() => setTermsAccepted(!termsAccepted)}>
          <Toggle checked={termsAccepted} onChange={setTermsAccepted} />
          <span className={styles.toggleLabel}>Aceito os termos e condições da plataforma</span>
        </div>
      </div>
    </>
  )

  return (
    <div className={styles.page}>
      <NavBar />

      <div className={styles.container}>
        <div className={styles.formCard}>
          <span className={styles.formBadge}>🔺 Tornar-se Prestador</span>

          <div className={styles.header}>
            <h1 className={styles.title}>Seja um Prestador ConectServ</h1>

            <p className={styles.subtitle}>
              Preencha as informações abaixo para solicitar seu cadastro como prestador de serviços na plataforma.
            </p>
          </div>

          {renderStepIndicator()}

          {error && <div className={styles.errorAlert}>{error}</div>}

          {activeStep === 1 && renderStep1()}
          {activeStep === 2 && renderStep2()}
          {activeStep === 3 && renderStep3()}
          {activeStep === 4 && renderStep4()}

          <div className={styles.infoCard}>
            <ShieldCheck className={styles.infoCardIcon} size={22} />
            <span className={styles.infoCardText}>
              Todas as solicitações passam por análise antes da aprovação.
            </span>
          </div>

          <div className={styles.actionsRow}>
            <button type="button" className={styles.btnSecondary} onClick={handleBack}>
              {activeStep === 1 ? 'Cancelar' : 'Voltar'}
            </button>

            {activeStep < 4 ? (
              <button type="button" className={styles.btnPrimary} onClick={handleNext}>
                Continuar
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar solicitação'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}