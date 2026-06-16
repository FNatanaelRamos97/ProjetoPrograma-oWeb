import { useState, useRef } from 'react'
import { Smile, Paperclip, Mic, Send } from 'lucide-react'
import styles from './ChatInput.module.css'

interface Props {
  onSend: (text: string) => void
}

export default function ChatInput({ onSend }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    onSend(text)
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.bar}>
      <button className={styles.iconBtn} title="Emoji"><Smile size={20} /></button>
      <button className={styles.iconBtn} title="Anexar"><Paperclip size={20} /></button>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          className={styles.input}
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {input.trim() ? (
        <button className={styles.sendBtn} onClick={handleSend} title="Enviar">
          <Send size={18} />
        </button>
      ) : (
        <button className={styles.iconBtn} title="Áudio"><Mic size={20} /></button>
      )}
    </div>
  )
}
