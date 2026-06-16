import { useState } from 'react'
import styles from './Sections.module.css'

export default function MensagensSection() {
  const [mensagemBusca, setMensagemBusca] = useState('')

  return (
    <div className={styles.messengerLayout}>
      <div className={styles.conversationList}>
        <div className={styles.messengerSearch}>
          <input className={styles.searchInput} type="text" placeholder="Buscar conversa..."
            value={mensagemBusca} onChange={e => setMensagemBusca(e.target.value)} />
        </div>
        <div className={styles.conversations}>
          <p className={styles.emptyText}>Nenhuma conversa encontrada.</p>
        </div>
      </div>
      <div className={styles.messageArea}>
        <div className={styles.messageHeader}>
          <span className={styles.messageHeaderName}>Selecione uma conversa</span>
        </div>
        <div className={styles.messagesBody}>
          <p className={styles.emptyText}>Selecione uma conversa para começar.</p>
        </div>
        <div className={styles.messageInput}>
          <input className={styles.searchInput} type="text" placeholder="Digite sua mensagem..." disabled />
          <button className={styles.sendBtn} disabled>Enviar</button>
        </div>
      </div>
    </div>
  )
}
