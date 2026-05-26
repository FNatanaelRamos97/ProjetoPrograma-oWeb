export type UserRole = 'cliente' | 'prestador' | 'prestador_pendente' | 'admin'

export interface Service {
  id: number
  name: string
  description: string
  price: number
  category: string
  subcategory: string
  estimatedTime: string
  location: string
  imageUrl: string | null
  provider_id: number
  provider_name: string
}

export interface User {
  id: number
  name: string
  email: string
  phone?: string | null
  identity?: string | null
  facebook?: string | null
  profileImageUrl?: string | null
  role: UserRole
}

export interface AuthResponse {
  token: string
  user: User
}

export interface AvailabilityDay {
  date: string
  day: number
  available: boolean
}

export interface Appointment {
  id: number
  serviceId: number
  providerId: number
  clientId: number
  appointmentDate: string
  status: 'pendente' | 'confirmado' | 'cancelado'
}

export interface AdminDashboard {
  totalUsers: number
  totalClients: number
  totalProviders: number
  totalServices: number
  totalAppointments: number
  pendingProviderRequests: number
}

export interface ProviderRequest {
  id: number
  userId: number
  userName: string
  userEmail: string
  status: 'pendente' | 'aprovado' | 'recusado'
  message: string
  createdAt: string
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