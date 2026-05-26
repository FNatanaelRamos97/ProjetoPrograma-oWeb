import { MessageCircle } from 'lucide-react'
import styles from './ChatEmptyState.module.css'

export default function ChatEmptyState() {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <MessageCircle size={64} />
      </div>
      <h3 className={styles.title}>Selecione uma conversa</h3>
      <p className={styles.sub}>Escolha um contato ao lado para começar a mensagem.</p>
    </div>
  )
}
