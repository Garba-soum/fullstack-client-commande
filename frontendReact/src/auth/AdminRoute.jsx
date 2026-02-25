import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

// Bloque si pas ADMIN
export default function AdminRoute({ children }) {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role !== 'ADMIN' && role !== 'ROLE_ADMIN') return <Navigate to="/forbidden" replace />

  return children
}
