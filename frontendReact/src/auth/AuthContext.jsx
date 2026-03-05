import { createContext, useContext, useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

function safeDecode(token) {
  try {
    return jwtDecode(token)
  } catch (e) {
    return null
  }
}

export function AuthProvider({ children }) {
  // ✅ on lit accessToken
  const [token, setToken] = useState(() => localStorage.getItem('accessToken') || '')
  const decoded = useMemo(() => (token ? safeDecode(token) : null), [token])

  const user = decoded
  const role = user?.role || user?.roles?.[0] || null

  // ✅ on stocke accessToken
  const login = (newToken) => {
    localStorage.setItem('accessToken', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setToken('')
  }

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ token, user, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}