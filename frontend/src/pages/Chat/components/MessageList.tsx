import { useRef, useEffect } from 'react'
import { CheckCheck } from 'lucide-react'
import type { Message } from '../types'
import styles from './MessageList.module.css'

interface Props {
  messages: Message[]
  typing: boolean
  contactName: string
}

function groupByDate(msgs: Message[]): { date: string; messages: Message[] }[] {
  const groups: Record<string, Message[]> = {}
  msgs.forEach(m => {
    if (!groups[m.date]) groups[m.date] = []
    groups[m.date].push(m)
  })
  return Object.entries(groups).map(([date, messages]) => ({ date, messages }))
}

export default function MessageList({ messages, typing, contactName }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const grouped = groupByDate(messages)

  if (messages.length === 0 && !typing) {
    return (
      <div className={styles.emptyChat}>
        <p className={styles.emptyChatText}>Nenhuma mensagem ainda. Envie algo para começar!</p>
      </div>
    )
  }

  return (
    <div className={styles.area}>
      {grouped.map(group => (
        <div key={group.date}>
          <div className={styles.dateDivider}>
            <span className={styles.dateLabel}>{group.date}</span>
          </div>
          {group.messages.map((msg, idx) => {
            const showStatus = msg.isSender && idx === group.messages.length - 1
            return (
              <div
                key={msg.id}
                className={`${styles.row} ${msg.isSender ? styles.rowSent : styles.rowReceived}`}
              >
                <div className={`${styles.bubble} ${msg.isSender ? styles.bubbleSent : styles.bubbleReceived}`}>
                  <span className={styles.bubbleText}>{msg.text}</span>
                  <span className={styles.bubbleMeta}>
                    <span className={styles.bubbleTime}>{msg.time}</span>
                    {showStatus && <CheckCheck size={13} className={styles.bubbleStatus} />}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ))}
      {typing && (
        <div className={`${styles.row} ${styles.rowReceived}`}>
          <div className={styles.typingBubble}>
            <span className={styles.typingName}>{contactName}</span>
            <div className={styles.typingDots}>
              <span className={styles.dot} /><span className={styles.dot} style={{ animationDelay: '0.2s' }} /><span className={styles.dot} style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
