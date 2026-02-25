import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'
import api from '../api/axios'

export default function Login() {
  // =========================
  // State du formulaire
  // =========================
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [asAdmin, setAsAdmin] = useState(false) 

  // =========================
  // UX : loading + message erreur
  // =========================
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // =========================
  // Navigation + retour route demandée
  // =========================
  const navigate = useNavigate()
  const location = useLocation()

  const { login } = useAuth()

  const redirectTo = location.state && location.state.from ? location.state.from : '/clients'

  // =========================
  // Soumission formulaire
  // =========================
  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login', {
        username,
        password,
        role: asAdmin ? 'ADMIN' : 'USER', 
      })

      const accessToken = res.data && res.data.accessToken ? res.data.accessToken : ''

      if (!accessToken) {
        throw new Error('accessToken manquant dans la réponse du backend')
      }

      login(accessToken)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const status = err && err.response ? err.response.status : 0

      if (status === 400) setError('Requête invalide (400). Vérifie les champs.')
      else if (status === 401) setError('Identifiants incorrects (401).')
      else if (status === 403) setError('Accès refusé (403).')
      else if (status === 500) setError('Erreur serveur (500).')
      else setError("Impossible de se connecter. Vérifie le backend et ta connexion.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
      <h1>Connexion</h1>
      <p>Connecte-toi pour accéder à l’application.</p>

      {error ? (
        <div
          style={{
            background: '#fde2e2',
            border: '1px solid #f5b5b5',
            padding: 12,
            borderRadius: 6,
            marginBottom: 12,
            color: '#7a1c1c',
          }}
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </div>

        {/*  Checkbox admin */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={asAdmin}
              onChange={(e) => setAsAdmin(e.target.checked)}
              disabled={loading}
            />
            Se connecter en tant qu’admin
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 6,
            border: 'none',
            background: loading ? '#bfbfbf' : '#1f6feb',
            color: 'white',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Pas encore de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    </div>
  )
}
