import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listServices, listProviders } from '@db/database'
import type { Service } from '../../types'
import NavBar from '../../components/NavBar/NavBar'
import styles from './Profissionais.module.css'

interface Professional {
  id: number
  name: string
  profileImageUrl: string | null
  services: Service[]
  serviceCount: number
}

export default function Profissionais() {
  const navigate = useNavigate()
  const [professionals, setProfessionals] = useState<Professional[]>([])

  useEffect(() => {
    Promise.all([listProviders(), listServices()]).then(([providers, services]) => {
      const serviceMap = new Map<number, Service[]>()
      services.forEach(s => {
        if (!serviceMap.has(s.provider_id)) serviceMap.set(s.provider_id, [])
        serviceMap.get(s.provider_id)!.push(s)
      })

      const merged = providers.map(p => ({
        id: p.id,
        name: p.name,
        profileImageUrl: p.profileImageUrl,
        services: serviceMap.get(p.id) || [],
        serviceCount: serviceMap.get(p.id)?.length || 0,
      }))

      setProfessionals(merged)
    })
  }, [])

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <NavBar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Profissionais</h1>
          <p className={styles.subtitle}>
            {professionals.length > 0
              ? `${professionals.length} profissionais disponíveis`
              : 'Carregando profissionais...'}
          </p>
        </div>

        {professionals.length === 0 ? (
          <p className={styles.empty}>Nenhum profissional encontrado.</p>
        ) : (
          <div className={styles.grid}>
            {professionals.map((pro) => (
              <div key={pro.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>
                    {pro.profileImageUrl ? (
                      <img className={styles.avatarImg} src={pro.profileImageUrl} alt={pro.name} />
                    ) : (
                      getInitials(pro.name)
                    )}
                  </div>
                  <span className={styles.verifiedBadge}>✓ Verificado</span>
                </div>
                <h3 className={styles.proName}>{pro.name}</h3>
                <span className={styles.proServices}>
                  {pro.serviceCount} {pro.serviceCount === 1 ? 'serviço' : 'serviços'} cadastrado{pro.serviceCount !== 1 ? 's' : ''}
                </span>
                <div className={styles.serviceList}>
                  {pro.services.map(s => (
                    <button
                      key={s.id}
                      className={styles.serviceTag}
                      onClick={() => navigate(`/produtos/${s.id}`)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
