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
  imageUrls: string[]
  provider_id: number
  provider_name: string
  provider_image?: string | null
  averageRating?: number
  totalReviews?: number
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
  reason?: string | null;
}

export interface ProviderUnavailableDate {
  id: number;
  providerId: number;
  unavailableDate: string;
  reason: string;
  createdAt: string;
}

export interface Appointment {
  id: number
  serviceId: number
  providerId: number
  clientId: number
  appointmentDate: string
  status: AppointmentStatus
}

export interface ClientAppointment {
  id: number
  appointmentDate: string
  status: AppointmentStatus
  serviceId: number
  serviceName: string
  providerId: number
  providerName: string
  clientId: number
  price: number
  cancellationReason?: string | null
  completedAt?: string | null
  createdAt: string
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

export interface Review {
  id: number
  rating: number
  comment: string
  clientName: string
  createdAt: string
}

export interface ReviewListResponse {
  reviews: Review[]
  average: number
  total: number
}

export interface Transaction {
  id: number
  userId: number
  type: 'deposito' | 'saque' | 'pagamento' | 'recebimento' | 'estorno'
  amount: number
  description: string
  status: 'liberado' | 'bloqueado' | 'devolvido'
  cancellationReason?: string | null
  referenceType?: string | null
  referenceId?: number | null
  createdAt: string
}

export interface WalletBalance {
  balance: number
  available: number
  escrow: number
}

export interface SalesLog {
  id: number
  amount: number
  paymentMethod: string
  status: string
  createdAt: string
  clientName?: string
  serviceName?: string
  providerName?: string
}

export interface SalesStats {
  totalRevenue: number
  totalSales: number
  completedCount: number
  pendingCount: number
}

export type AppointmentStatus =
  | 'pendente_pagamento'
  | 'pago'
  | 'em_execucao'
  | 'concluido'
  | 'cancelado'
  | 'reembolsado'