export interface Service {
  id: number
  name: string
  description: string
  price: number
  category: string
  provider_id: number
  provider_name: string
}

export interface User {
  id: number
  name: string
  email: string
  role: 'cliente' | 'prestador' | 'prestador_pendente' | 'admin'
}

export interface ChatMessage {
  id: number
  text: string
  isSender: boolean
}

export interface ScheduleSlot {
  day: number
  available: boolean
}

export interface CategoryCard {
  id: number
  title: string
  icon: string
  route: string
}
