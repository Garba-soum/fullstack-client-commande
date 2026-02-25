import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'
import { getClients } from '../services/clientService'
import { getOrders, createOrder, updateOrder, deleteOrder } from '../services/orderService'

export default function Orders() {
  // =========================
  // Auth / rôle
  // =========================
  const { role, logout } = useAuth()
  const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN'
  const navigate = useNavigate()

  // =========================
  // Data + UX
  // =========================
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // =========================
  // Filtre par client
  // =========================
  const [clientFilter, setClientFilter] = useState('ALL')

  // =========================
  // Formulaire Add/Edit (ADMIN)
  // =========================
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({    
    description: '',
    montant: '',
    dateCommande: '',
    clientId: '',
  })

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAll() {
    setLoading(true)
    setError('')
    try {
      // On charge clients + commandes (pour affichage + filtre)
      const [cData, oData] = await Promise.all([getClients(), getOrders()])
      setClients(Array.isArray(cData) ? cData : [])
      setOrders(Array.isArray(oData) ? oData : [])
    } catch (err) {
      handleHttpError(err, setError)
    } finally {
      setLoading(false)
    }
  }

  function handleHttpError(err, setErrorFn) {
    const status = err?.response?.status || 0

    // 401 : session invalide -> logout + login
    if (status === 401) {
      logout()
      navigate('/login', { replace: true })
      return
    }

    //  403 : pas autorisé -> forbidden
    if (status === 403) {
      navigate('/forbidden', { replace: true })
      return
    }

    if (status === 400) setErrorFn('Requête invalide (400).')
    else if (status === 409) setErrorFn('Conflit (409).')
    else if (status === 500) setErrorFn('Erreur serveur (500).')
    else setErrorFn("Erreur réseau. Vérifie le backend.")
  }

  // =========================
  // Helpers client (pour afficher "Client : nom — email — tel")
  // =========================
  function findClientById(id) {
    const num = Number(id)
    for (let i = 0; i < clients.length; i++) {
      if (clients[i].id === num) return clients[i]
    }
    return null
  }

  // =========================
  // Filtrage commandes par client
  // =========================
  const filteredOrders = useMemo(() => {
    if (clientFilter === 'ALL') return orders
    const id = Number(clientFilter)

    return orders.filter((o) => {
      // Selon le backend, ça peut être o.clientId, ou o.client.id
      if (o.clientId != null) return Number(o.clientId) === id
      if (o.client && o.client.id != null) return Number(o.client.id) === id
      return false
    })
  }, [orders, clientFilter])

  // =========================
  // Ouvrir / fermer formulaire
  // =========================
  function openAddForm() {
    if (!isAdmin) return
    setFormError('')
    setEditingId(null)
    setForm({
      description: '',
      montant: '',
      dateCommande: '',
      clientId: clients.length > 0 ? String(clients[0].id) : '',
    })
    setFormOpen(true)
  }

  function openEditForm(order) {
    if (!isAdmin) return
    setFormError('')
    setEditingId(order.id)

    const clientId =
      order.clientId != null
        ? String(order.clientId)
        : order.client && order.client.id != null
          ? String(order.client.id)
          : ''

    setForm({
      description: order.description || '',
      montant: order.montant != null ? String(order.montant) : '',
      dateCommande: order.dateCommande || '',
      clientId: clientId,
    })
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setFormError('')
  }

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // =========================
  // Submit Add/Edit (ADMIN)
  // =========================
  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!isAdmin) {
      setFormError('Action non autorisée : ADMIN uniquement.')
      return
    }

    //  validation simple
    if (!form.description.trim()) {
      setFormError('La description est obligatoire.')
      return
    }
    if (!form.clientId) {
      setFormError('Veuillez choisir un client.')
      return
    }

    setFormLoading(true)
    try {
      const payload = {
        description: form.description.trim(),
        montant: Number(form.montant),
        dateCommande: form.dateCommande, // format YYYY-MM-DD
        clientId: Number(form.clientId),
      }

      if (editingId == null) {
        await createOrder(payload)
      } else {
        await updateOrder(editingId, payload)
      }

      await loadAll()
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
  async function handleDelete(order) {
    if (!isAdmin) return
    const ok = window.confirm(`Supprimer la commande #${order.id} ?`)
    if (!ok) return

    try {
      await deleteOrder(order.id)
      await loadAll()
    } catch (err) {
      handleHttpError(err, setError)
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <div style={styles.topRow}>
        <h2 style={{ margin: 0 }}>Commandes</h2>

        {isAdmin ? (
          <button onClick={openAddForm} style={styles.primaryBtn}>
            + Ajouter une commande
          </button>
        ) : null}
      </div>

      {/*  Filtre par client */}
      <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
        <label style={{ fontWeight: 600 }}>Filtrer par client :</label>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          disabled={loading}
          style={styles.select}
        >
          <option value="ALL">Tous</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom} ({c.email})
            </option>
          ))}
        </select>
      </div>

      {error ? <div style={styles.errorBox}>{error}</div> : null}
      {loading ? <p>Chargement...</p> : null}

      {/* Form Add/Edit */}
      {formOpen ? (
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={{ margin: 0 }}>
              {editingId == null ? 'Ajouter une commande' : 'Modifier une commande'}
            </h3>
            <button onClick={closeForm} style={styles.lightBtn} disabled={formLoading}>
              Fermer
            </button>
          </div>

          {formError ? <div style={styles.errorBox}>{formError}</div> : null}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
            <input
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Description"
              disabled={formLoading}
              style={styles.input}
              required
            />

            <input
              name="montant"
              value={form.montant}
              onChange={onChange}
              placeholder="Montant"
              type="number"
              step="0.01"
              disabled={formLoading}
              style={styles.input}
              required
            />

            <input
              name="dateCommande"
              value={form.dateCommande}
              onChange={onChange}
              type="date"
              disabled={formLoading}
              style={styles.input}
              required
            />

            <select
              name="clientId"
              value={form.clientId}
              onChange={onChange}
              disabled={formLoading}
              style={styles.select}
              required
            >
              {clients.length === 0 ? <option value="">Aucun client</option> : null}
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom} — {c.email} — {c.telephone}
                </option>
              ))}
            </select>

            <button type="submit" disabled={formLoading} style={styles.primaryBtn}>
              {formLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </div>
      ) : null}

      {/*  Liste (cards) */}
      <div style={{ marginTop: 16, display: 'grid', gap: 14 }}>
        {filteredOrders.length === 0 && !loading ? <p>Aucune commande.</p> : null}

        {filteredOrders.map((o) => {
          //  selon backend: clientId ou client.id
          const cid = o.clientId != null ? o.clientId : o.client?.id
          const client = cid != null ? findClientById(cid) : null

          return (
            <div key={o.id} style={styles.card}>
              <h3 style={{ marginTop: 0 }}>Commande #{o.id}</h3>

              <p style={styles.p}>
                <b>Description :</b> {o.description}
              </p>
              <p style={styles.p}>
                <b>Montant :</b> {o.montant} €
              </p>
              <p style={styles.p}>
                <b>Date :</b> {o.dateCommande}
              </p>

              {/*  Association commande ↔ client */}
              <p style={styles.p}>
                <b>Client :</b>{' '}
                {client ? (
                  <>
                    {client.nom} — {client.email} — {client.telephone}
                  </>
                ) : (
                  <span style={{ color: '#666' }}>Inconnu</span>
                )}
              </p>

              {/*  Actions admin only */}
              {isAdmin ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => openEditForm(o)} style={styles.lightBtn}>
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(o)} style={styles.dangerBtn}>
                    Supprimer
                  </button>
                </div>
              ) : null}
            </div>
          )
        })}
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
  card: {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: 14,
    background: '#fff',
  },
  p: { margin: '6px 0' },
  formCard: {
    marginTop: 14,
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
  select: {
    padding: 10,
    borderRadius: 6,
    border: '1px solid #ccc',
    minWidth: 280,
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
    marginTop: 12,
    color: '#7a1c1c',
  },
}
