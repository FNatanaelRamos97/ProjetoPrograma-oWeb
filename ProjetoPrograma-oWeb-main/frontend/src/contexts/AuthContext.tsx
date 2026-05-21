import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isPrestador: boolean
  isAdmin: boolean
  isPrestadorPendente: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const USER_KEY = 'conectserv_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY)
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }, [user])

  const login = (u: User) => setUser(u)
  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout, isPrestador: user?.role === 'prestador', isAdmin: user?.role === 'admin', isPrestadorPendente: user?.role === 'prestador_pendente' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
