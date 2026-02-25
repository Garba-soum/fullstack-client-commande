import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'
import { getClients, createClient, updateClient, deleteClient } from '../services/clientService'

export default function Clients() {
  // =========================
  // Auth / rôle
  // =========================
  const { role, logout } = useAuth()
  const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN'
  const navigate = useNavigate()

  // =========================
  // Data + UX
  // =========================
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // =========================
  // Formulaire (Add/Edit)
  // =========================
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ nom: '', email: '', telephone: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // =========================
  // Chargement initial
  // =========================
  useEffect(() => {
    loadClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadClients() {
    setLoading(true)
    setError('')
    try {
      const data = await getClients()
      setClients(Array.isArray(data) ? data : [])
    } catch (err) {
      handleHttpError(err, setError)
    } finally {
      setLoading(false)
    }
  }

  //  Centralise la gestion d’erreur HTTP (propre + réutilisable)
  function handleHttpError(err, setErrorFn) {
    const status = err?.response?.status || 0

    if (status === 401) {
      //  session invalide/expirée → logout + retour login
      logout()
      navigate('/login', { replace: true })
      return
    }
    if (status === 403) {
      navigate('/forbidden', { replace: true })
      return
    }

    if (status === 400) setErrorFn('Requête invalide (400).')
    else if (status === 409) setErrorFn('Conflit (409). Ressource déjà existante.')
    else if (status === 500) setErrorFn('Erreur serveur (500).')
    else setErrorFn("Erreur réseau. Vérifie le backend ou l'URL.")
  }

  // =========================
  // Filtrage (recherche nom/email/tel)
  // =========================
  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return clients

    return clients.filter((c) => {
      const nom = (c.nom || '').toLowerCase()
      const email = (c.email || '').toLowerCase()
      const tel = (c.telephone || '').toLowerCase()
      return nom.includes(q) || email.includes(q) || tel.includes(q)
    })
  }, [clients, search])

  // =========================
  // Ouvrir formulaire Add / Edit
  // =========================  
  function openAddForm() {
    setFormError('')
    setEditingId(null)
    setForm({ nom: '', email: '', telephone: '' })
    setFormOpen(true)
  }

  function openEditForm(client) {
    setFormError('')
    setEditingId(client.id)
    setForm({
      nom: client.nom || '',
      email: client.email || '',
      telephone: client.telephone || '',
    })
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setFormError('')
    setForm({ nom: '', email: '', telephone: '' })
  }

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // =========================
  // Submit Add / Edit (ADMIN)
  // =========================
  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!isAdmin) {
      setFormError("Action non autorisée : ADMIN uniquement.")
      return
    }

    //  petite validation front (pro)
    if (!form.nom.trim()) {
      setFormError('Le nom est obligatoire.')
      return
    }

    setFormLoading(true)
    try {
      if (editingId == null) {
        // Création
        await createClient({
          nom: form.nom.trim(),
          email: form.email.trim(),
          telephone: form.telephone.trim(),
        })
      } else {
        //  Modification
        await updateClient(editingId, {
          nom: form.nom.trim(),
          email: form.email.trim(),
          telephone: form.telephone.trim(),
        })
      }

      // Refresh liste + fermeture form (UX)
      await loadClients()
      closeForm()
    } catch (err) {
      handleHttpError(err, setFormError)
    } finally {
      setFormLoading(false)
    }
  }

  // =========================
  // Delete (ADMIN)
  // =========================
  async function handleDelete(client) {
    if (!isAdmin) return

    const ok = window.confirm(`Supprimer le client "${client.nom}" ?`)
    if (!ok) return

    try {
      await deleteClient(client.id)
      await loadClients()
    } catch (err) {
      handleHttpError(err, setError)
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <div style={styles.topRow}>
        <h2 style={{ margin: 0 }}>Clients</h2>

        {/*  Bouton visible seulement admin */}
        {isAdmin ? (
          <button onClick={openAddForm} style={styles.primaryBtn}>
            + Ajouter un client
          </button>
        ) : null}
      </div>

      {/* Recherche */}
      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher (nom, email, téléphone)..."
          style={styles.search}
          disabled={loading}
        />
      </div>

      {/*  Erreur */}
      {error ? <div style={styles.errorBox}>{error}</div> : null}

      {/*  Loading */}
      {loading ? <p>Chargement...</p> : null}

      {/*  Formulaire Add/Edit (ADMIN) */}
      {formOpen ? (
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={{ margin: 0 }}>
              {editingId == null ? 'Ajouter un client' : 'Modifier un client'}
            </h3>
            <button onClick={closeForm} style={styles.lightBtn} disabled={formLoading}>
              Fermer
            </button>
          </div>

          {formError ? <div style={styles.errorBox}>{formError}</div> : null}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
            <input
              name="nom"
              value={form.nom}
              onChange={onChange}
              placeholder="Nom"
              disabled={formLoading}
              style={styles.input}
              required
            />
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="Email"
              disabled={formLoading}
              style={styles.input}
            />
            <input
              name="telephone"
              value={form.telephone}
              onChange={onChange}
              placeholder="Téléphone"
              disabled={formLoading}
              style={styles.input}
            />

            <button type="submit" disabled={formLoading} style={styles.primaryBtn}>
              {formLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </div>
      ) : null}

      {/* Tableau */}
      <div style={{ overflowX: 'auto', marginTop: 12 }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Téléphone</th>
              <th style={styles.th}>Commandes</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.length === 0 && !loading ? (
              <tr>
                <td colSpan="5" style={styles.td}>
                  Aucun client trouvé.
                </td>
              </tr>
            ) : null}

            {filteredClients.map((c) => (
              <tr key={c.id}>
                <td style={styles.td}>{c.nom}</td>
                <td style={styles.td}>{c.email}</td>
                <td style={styles.td}>{c.telephone}</td>
                <td style={styles.td}>{c.ordersCount != null ? c.ordersCount : '-'}</td>

                <td style={styles.td}>
                  {/*  Ici tu pourras ajouter "Voir" si tu fais une page /clients/:id */}
                  {isAdmin ? (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button onClick={() => openEditForm(c)} style={styles.lightBtn}>
                        Modifier
                      </button>
                      <button onClick={() => handleDelete(c)} style={styles.dangerBtn}>
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: '#666' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles = {
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  search: {
    width: '100%',
    padding: 10,
    borderRadius: 6,
    border: '1px solid #ccc',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #ddd',
  },
  th: {
    textAlign: 'left',
    padding: 10,
    borderBottom: '1px solid #ddd',
    background: '#f7f7f7',
  },
  td: {
    padding: 10,
    borderBottom: '1px solid #eee',
  },
  formCard: {
    marginTop: 12,
    padding: 12,
    border: '1px solid #ddd',
    borderRadius: 8,
    background: '#fff',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: '1px solid #ccc',
  },
  primaryBtn: {
    padding: '10px 12px',
    borderRadius: 6,
    border: 'none',
    background: '#1f6feb',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  lightBtn: {
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #ccc',
    background: '#f7f7f7',
    cursor: 'pointer',
    fontWeight: 600,
  },
  dangerBtn: {
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #e1a1a1',
    background: '#fde2e2',
    cursor: 'pointer',
    fontWeight: 700,
  },
  errorBox: {
    background: '#fde2e2',
    border: '1px solid #f5b5b5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    color: '#7a1c1c',
  },
}

