import { useRef, useEffect } from 'react'
import { CheckCheck } from 'lucide-react'
import type { Contact } from '../types'
import styles from './ConversationList.module.css'

interface Props {
  contacts: Contact[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export default function ConversationList({ contacts, selectedId, onSelect }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const handler = () => { /* preparado para virtualização futura */ }
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  if (contacts.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyText}>Nenhuma conversa encontrada</span>
      </div>
    )
  }

  return (
    <div className={styles.list} ref={listRef}>
      {contacts.map(c => {
        const isActive = c.id === selectedId
        return (
          <button
            key={c.id}
            className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
            onClick={() => onSelect(c.id)}
          >
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>{c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
              {c.online && <span className={styles.onlineDot} />}
            </div>
            <div className={styles.content}>
              <div className={styles.topRow}>
                <span className={styles.name}>{c.name}</span>
                <span className={styles.time}>{c.time}</span>
              </div>
              <div className={styles.bottomRow}>
                <span className={styles.lastMsg}>{c.lastMsg}</span>
                <div className={styles.right}>
                  {c.unread > 0 && <span className={styles.unreadBadge}>{c.unread}</span>}
                  {c.unread === 0 && <CheckCheck size={14} className={styles.readIcon} />}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
