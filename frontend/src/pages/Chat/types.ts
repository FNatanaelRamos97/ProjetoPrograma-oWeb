export interface Contact {
  id: number
  name: string
  unread: number
  online: boolean
  lastMsg: string
  time: string
  lastSeen: string | null
}

export interface Message {
  id: number
  text: string
  isSender: boolean
  time: string
  date: string
}
