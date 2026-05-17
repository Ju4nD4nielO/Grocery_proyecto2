import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

// Usuarios hardcodeados para demo (en producción vendría del backend)
const USERS = [
  { id: 1, username: 'admin',   password: 'admin123',  role: 'Gerente',  nombre: 'Rosa Tzoc' },
  { id: 2, username: 'cajero',  password: 'cajero123', role: 'Cajero',   nombre: 'Roberto Ajú' },
  { id: 3, username: 'vendedor',password: 'vend123',   role: 'Vendedor', nombre: 'Elena Cuc' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('grocery_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = useCallback((username, password) => {
    const found = USERS.find(u => u.username === username && u.password === password)
    if (!found) throw new Error('Credenciales incorrectas')
    const { password: _pw, ...safeUser } = found
    setUser(safeUser)
    sessionStorage.setItem('grocery_user', JSON.stringify(safeUser))
    return safeUser
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem('grocery_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}