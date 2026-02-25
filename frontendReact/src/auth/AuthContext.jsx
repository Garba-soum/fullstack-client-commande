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
  // init : si token déjà en localStorage, on restaure la session
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const decoded = useMemo(() => (token ? safeDecode(token) : null), [token])

  // user = payload du JWT (ex: sub/email, role, exp...)
  const user = decoded

  //  rôle (selon ton backend: parfois "ROLE_ADMIN" ou "ADMIN")
  const role = user?.role || user?.roles?.[0] || null

  //  login: sauvegarde token + met à jour le state global
  const login = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  // logout: supprime token + purge le state
  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
  }

  //  isAuthenticated = vrai si token présent ET décodable
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
