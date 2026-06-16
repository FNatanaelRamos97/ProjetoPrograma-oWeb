import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProviderReviews, listServices, updateUserProfile } from '@db/database'
import { useAuth } from '../../contexts/AuthContext'
import type { Review, Service } from '../../types'
import NavBar from '../../components/NavBar/NavBar'
import styles from './Perfil.module.css'

function getNivel(serviceCount: number) {
  if (serviceCount >= 6) return { label: 'Avançado', fill: 4 }
  if (serviceCount >= 3) return { label: 'Intermediário', fill: 2 }
  return { label: 'Iniciante', fill: 1 }
}

export default function Perfil() {
  const navigate = useNavigate()
  const { user, token, updateUser } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('profileImage', file)

    const updated = await updateUserProfile(formData, token)
    setUploading(false)

    if (updated) {
      updateUser(updated)
    }
  }

  useEffect(() => {
    if (user) {
      listServices().then(all => {
        const mine = all.filter(s => s.provider_id === user.id)
        setServices(mine)
      })
      if (user.role === 'prestador') {
        getProviderReviews(user.id).then(setReviews)
      }
    }
  }, [user])

  if (!user) {
    return (
      <div className={styles.page}>
        <NavBar />
        <div className={styles.container}>
          <p className={styles.empty}>Faça login para ver seu perfil.</p>
        </div>
      </div>
    )
  }

  const nivel = getNivel(services.length)

  const verificacoes = [
    { id: 'email', label: 'E-mail', ok: true },
    { id: 'telefone', label: 'Telefone', ok: true },
    { id: 'identidade', label: 'Identidade', ok: false },
  ]

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.pageContent}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
          <h1 className={styles.topTitle}>Perfil</h1>
          <button className={styles.shareBtn} onClick={() => {}}>⎔</button>
        </div>

        <div className={styles.card}>
          <div className={styles.profileRow}>
            <div className={styles.avatar} onClick={() => fileInputRef.current?.click()}>
              {user.profileImageUrl ? (
                <img className={styles.avatarImg} src={user.profileImageUrl} alt={user.name} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
              <div className={styles.avatarOverlay}>
                {uploading ? '...' : '📷'}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className={styles.uploadHidden}
                onChange={handleProfileImageUpload}
              />
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.verifiedBadge}>
                <span className={styles.checkIcon}>✓</span> CONTA VERIFICADA
              </span>
              <h2 className={styles.profileName}>{user.name}</h2>
              <p className={styles.profileMeta}>Último acesso hoje</p>
            </div>
          </div>

          <div className={styles.nivelRow}>
            <div className={styles.nivelLeft}>
              <span className={styles.nivelLabel}>Nível</span>
              <span className={styles.nivelBadge}>
                <span className={styles.shieldIcon}>🛡</span> {nivel.label}
              </span>
            </div>
            <button className={styles.saibaMais}>Saiba mais</button>
          </div>

          <div className={styles.progressBar}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`${styles.progressSeg} ${i <= nivel.fill ? styles.progressFilled : ''}`} />
            ))}
          </div>

          <div className={styles.platformSince}>
            <span className={styles.calendarIcon}>📅</span> Na ConectServ desde maio de 2026
          </div>

          <div className={styles.verificacoes}>
            {verificacoes.map(v => (
              <div key={v.id} className={styles.verItem}>
                <span className={`${styles.verCircle} ${v.ok ? styles.verOk : styles.verPending}`}>
                  {v.ok ? '✓' : '○'}
                </span>
                <span className={styles.verLabel}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sectionTitle}>Histórico</div>
        <div className={styles.histCard}>
          <div className={styles.histNumber}>
            <span className={styles.histNumBig}>{String(services.length).padStart(2, '0')}</span>{' '}
            {services.length === 1 ? 'serviço' : 'serviços'}
          </div>
          <p className={styles.histDesc}>
            Publicados nos últimos <strong>180 dias</strong>
          </p>
        </div>

        <div className={styles.sectionTitle}>
          {user.role === 'prestador' ? 'Meus Serviços' : 'Meus Agendamentos'}
        </div>
        <p className={styles.serviceCount}>
          {services.length} de {services.length} {services.length === 1 ? 'serviço publicado' : 'serviços publicados'}
        </p>

        {user.role === 'prestador' && services.length > 0 && (
          <div className={styles.serviceList}>
            {services.map(s => (
              <div key={s.id} className={styles.serviceCard} onClick={() => navigate(`/produtos/${s.id}`)}>
                <div className={styles.serviceCircle}>
                  {s.imageUrls && s.imageUrls.length > 0 ? (
                    <img className={styles.serviceCircleImg} src={s.imageUrls[0]} alt={s.name} />
                  ) : s.imageUrl ? (
                    <img className={styles.serviceCircleImg} src={s.imageUrl} alt={s.name} />
                  ) : (
                    s.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className={styles.serviceInfo}>
                  <p className={styles.serviceName}>{s.name}</p>
                  <p className={styles.servicePrice}>R$ {s.price.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {user.role === 'prestador' && reviews.length > 0 && (
          <>
            <div className={styles.sectionTitle}>Avaliações ({reviews.length})</div>
            <div className={styles.reviewList}>
              {reviews.map((r) => (
                <div key={r.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewAuthor}>{r.clientName}</span>
                    <span className={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={i <= r.rating ? styles.starFilled : styles.starEmpty}>★</span>
                      ))}
                    </span>
                  </div>
                  {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
                  <span className={styles.reviewDate}>
                    {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
