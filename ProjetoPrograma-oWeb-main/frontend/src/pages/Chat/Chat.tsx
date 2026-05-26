import { useState, useCallback } from 'react'
import NavBar from '../../components/NavBar/NavBar'
import ChatSidebar from './components/ChatSidebar'
import ChatHeader from './components/ChatHeader'
import MessageList from './components/MessageList'
import ChatInput from './components/ChatInput'
import ChatEmptyState from './components/ChatEmptyState'
import type { Message, Contact } from './types'
import styles from './Chat.module.css'

const contacts: Contact[] = [
  { id: 1, name: 'João Silva', unread: 2, online: true, lastMsg: 'Ótimo serviço, recomendo!', time: '10:30', lastSeen: null },
  { id: 2, name: 'Maria Santos', unread: 0, online: true, lastMsg: 'Vou confirmar para amanhã', time: '09:15', lastSeen: null },
  { id: 3, name: 'Carlos Lima', unread: 1, online: false, lastMsg: 'Pode ser na quinta?', time: 'Ontem', lastSeen: 'visto há 30 min' },
  { id: 4, name: 'Ana Oliveira', unread: 0, online: true, lastMsg: 'Entendi, vamos marcar', time: 'Ontem', lastSeen: null },
  { id: 5, name: 'Pedro Costa', unread: 0, online: false, lastMsg: 'Recebi o pagamento', time: 'Segunda', lastSeen: 'visto há 2 horas' },
]

const chatMessages: Record<number, Message[]> = {
  1: [
    { id: 1, text: 'Olá! Vi que você tem interesse no serviço de instalação elétrica.', isSender: false, time: '10:00', date: 'Hoje' },
    { id: 2, text: 'Olá, João! Sim, tenho interesse.', isSender: true, time: '10:02', date: 'Hoje' },
    { id: 3, text: 'Posso te ajudar com isso.', isSender: false, time: '10:03', date: 'Hoje' },
    { id: 4, text: 'Preciso instalar algumas tomadas e luminárias.', isSender: true, time: '10:05', date: 'Hoje' },
    { id: 5, text: 'Perfeito! Podemos agendar para terça às 14h?', isSender: false, time: '10:06', date: 'Hoje' },
    { id: 6, text: 'Sim, pode ser!', isSender: true, time: '10:08', date: 'Hoje' },
  ],
  2: [
    { id: 1, text: 'Bom dia! Precisa de limpeza hoje?', isSender: false, time: '09:00', date: 'Hoje' },
    { id: 2, text: 'Bom dia, Maria! Sim, pode ser às 14h.', isSender: true, time: '09:05', date: 'Hoje' },
    { id: 3, text: 'Vou confirmar para amanhã então.', isSender: false, time: '09:15', date: 'Hoje' },
  ],
  3: [
    { id: 1, text: 'E aí, tudo bem? O serviço de pintura ainda está disponível?', isSender: true, time: '15:00', date: 'Ontem' },
    { id: 2, text: 'Tudo sim! Disponivel nesta semana ainda.', isSender: false, time: '15:10', date: 'Ontem' },
    { id: 3, text: 'Pode ser na quinta?', isSender: false, time: '15:11', date: 'Ontem' },
  ],
}

export default function Chat() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Record<number, Message[]>>(chatMessages)
  const [typing, setTyping] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  const contact = contacts.find(c => c.id === selectedId) ?? null
  const msgs = selectedId ? messages[selectedId] ?? [] : []

  const handleSelect = useCallback((id: number) => {
    setSelectedId(id)
    setShowSidebar(false)
    setTyping(false)
  }, [])

  const handleSend = useCallback((text: string) => {
    if (!selectedId) return
    const msg: Message = {
      id: Date.now(),
      text,
      isSender: true,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: 'Hoje',
    }
    setMessages(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), msg],
    }))
    setTimeout(() => setTyping(true), 800)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => ({
        ...prev,
        [selectedId]: [
          ...(prev[selectedId] ?? []),
          { id: Date.now() + 1, text: 'Ótimo! Vou confirmar aqui.', isSender: false, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), date: 'Hoje' },
        ],
      }))
    }, 2500)
  }, [selectedId])

  const handleBack = useCallback(() => {
    setShowSidebar(true)
  }, [])

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.chatLayout}>
          <div className={`${styles.sidebar} ${showSidebar ? styles.sidebarVisible : styles.sidebarHidden}`}>
            <ChatSidebar
              contacts={contacts}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>
          <div className={`${styles.chatArea} ${!showSidebar ? styles.chatAreaFull : ''}`}>
            {contact ? (
              <>
                <ChatHeader contact={contact} onBack={handleBack} />
                <MessageList messages={msgs} typing={typing} contactName={contact.name} />
                <ChatInput onSend={handleSend} />
              </>
            ) : (
              <ChatEmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
