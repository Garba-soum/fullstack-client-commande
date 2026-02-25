import api from '../api/axios'

// GET /commandes (USER + ADMIN)
export async function getOrders() {
  const res = await api.get('/commandes')
  return res.data
}

// POST /commandes (ADMIN)
export async function createOrder(payload) {
  // payload : { description, montant, dateCommande, clientId }
  const res = await api.post('/commandes', payload)
  return res.data
}

// PUT /commandes/{id} (ADMIN)
export async function updateOrder(id, payload) {
  const res = await api.put(`/commandes/${id}`, payload)
  return res.data
}

// DELETE /commandes/{id} (ADMIN)
export async function deleteOrder(id) {
  const res = await api.delete(`/commandes/${id}`)
  return res.data
}
