import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

// Bloque l’accès si pas connecté
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // on garde la page demandée pour y revenir après login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}
