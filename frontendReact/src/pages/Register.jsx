import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Register() {
  // =========================
  // State formulaire
  // =========================
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // =========================
  // UX : loading + erreurs
  // =========================
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation front : mot de passe = confirmation
    // (ça évite un aller/retour backend inutile)
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    try {
      //  Endpoint attendu : POST /auth/register
      // Body typique : { username, email, password }
      // Email est optionnel (comme ton UI)
      await api.post('/auth/register', {
        username: form.username,
        email: form.email ? form.email : null,
        password: form.password,
      })

      //  UX : message puis redirection login
      setSuccess('Compte créé avec succès. Tu peux te connecter.')
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 700)
    } catch (err) {
      const status = err && err.response ? err.response.status : 0

      //  Messages alignés avec Angular
      if (status === 409) setError("Nom d'utilisateur déjà utilisé.")
      else if (status === 400) setError('Données invalides (400). Vérifie les champs.')
      else if (status === 500) setError('Erreur serveur (500).')
      else setError("Impossible de créer le compte. Vérifie le backend.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
      <h1>Créer un compte</h1>
      <p>Inscription utilisateur.</p>

      {/*  Message erreur (rouge) */}
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

      {/*  Message succès (vert) */}
      {success ? (
        <div
          style={{
            background: '#e7f7ea',
            border: '1px solid #a6e3b2',
            padding: 12,
            borderRadius: 6,
            marginBottom: 12,
            color: '#135b20',
          }}
        >
          {success}
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
            Username
          </label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            disabled={loading}
            required
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
            Email (optionnel)
          </label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
            type="email"
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
            Mot de passe
          </label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
            type="password"
            required
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
            Confirmer le mot de passe
          </label>
          <input
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            type="password"
            required
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
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
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  )
}
