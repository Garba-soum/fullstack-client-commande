import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

 
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN'

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <div style={styles.left}>
          {}
          {!isAuthPage && (
            <>
              <NavLink to="/clients" style={styles.link}>
                Clients
              </NavLink>

              <NavLink to="/orders" style={styles.link}>
                Commandes
              </NavLink>

              {isAuthenticated && isAdmin ? (
                <NavLink to="/admin/create" style={styles.link}>
                  Admin
                </NavLink>
              ) : null}
            </>
          )}
        </div>

        <div style={styles.right}>
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" style={styles.smallLink}>
                Login
              </NavLink>
              <NavLink to="/register" style={styles.smallLink}>
                Register
              </NavLink>
            </>
          ) : (
            <>
              <span style={styles.badge}>
                {role ? role.replace('ROLE_', '') : 'USER'}
              </span>

              <button onClick={handleLogout} style={styles.logoutBtn}>
                Déconnexion
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

const styles = {
  header: {
    borderBottom: '1px solid #ddd',
    padding: '10px 16px',
    marginBottom: 18,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    maxWidth: 1100,       //  optionnel : centre visuellement
    margin: '0 auto',     //  optionnel : centre visuellement
    width: '100%',
  },
  left: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  right: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },

  //  style actif NavLink
  link: ({ isActive }) => ({
    textDecoration: 'none',
    fontWeight: 600,
    color: isActive ? '#1f6feb' : '#111',
  }),

  smallLink: ({ isActive }) => ({
    textDecoration: 'none',
    color: isActive ? '#111' : '#1f6feb',
    fontWeight: 600,
  }),

  badge: {
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 999,
    border: '1px solid #ccc',
  },
  logoutBtn: {    
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #ccc',
    background: '#f7f7f7',
    cursor: 'pointer',
    fontWeight: 600,
  },
}
