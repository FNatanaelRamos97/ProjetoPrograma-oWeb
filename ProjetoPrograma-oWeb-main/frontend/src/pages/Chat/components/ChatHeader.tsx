import { ChevronLeft, Phone, Video, MoreVertical } from 'lucide-react'
import type { Contact } from '../types'
import styles from './ChatHeader.module.css'

interface Props {
  contact: Contact
  onBack: () => void
}

export default function ChatHeader({ contact, onBack }: Props) {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Voltar">
          <ChevronLeft size={20} />
        </button>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>{contact.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
          {contact.online && <span className={styles.onlineDot} />}
        </div>
        <div>
          <div className={styles.nameRow}>
            <span className={styles.name}>{contact.name}</span>
            <svg viewBox="0 0 24 24" fill="#2563eb" width="14" height="14">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
          <span className={styles.status}>
            {contact.online ? 'Online' : contact.lastSeen ?? 'Offline'}
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.actionBtn} title="Ligação"><Phone size={18} /></button>
        <button className={styles.actionBtn} title="Vídeo"><Video size={18} /></button>
        <button className={styles.actionBtn} title="Mais"><MoreVertical size={18} /></button>
      </div>
    </div>
  )
}
