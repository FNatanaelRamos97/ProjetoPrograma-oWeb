import { useState } from 'react'
import { Search, PenSquare } from 'lucide-react'
import ConversationList from './ConversationList'
import type { Contact } from '../types'
import styles from './ChatSidebar.module.css'

interface Props {
  contacts: Contact[]
  selectedId: number | null
  onSelect: (id: number) => void
}

type Tab = 'todas' | 'naolidas'

export default function ChatSidebar({ contacts, selectedId, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('todas')

  const filtered = contacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMsg.toLowerCase().includes(search.toLowerCase())
    if (tab === 'naolidas') return matchSearch && c.unread > 0
    return matchSearch
  })

  const unreadCount = contacts.reduce((a, c) => a + c.unread, 0)

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>Mensagens</h2>
        <button className={styles.newBtn} title="Novo chat">
          <PenSquare size={18} />
        </button>
      </div>

      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder="Buscar conversas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tabs}>
        {(['todas', 'naolidas'] as Tab[]).map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'todas' ? 'Todas' : 'Não lidas'}
            {t === 'naolidas' && unreadCount > 0 && (
              <span className={styles.tabBadge}>{unreadCount}</span>
            )}
            {tab === t && <span className={styles.tabUnderline} />}
          </button>
        ))}
      </div>

      <ConversationList
        contacts={filtered}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </div>
  )
}
