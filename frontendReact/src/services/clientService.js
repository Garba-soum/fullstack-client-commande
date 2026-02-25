import api from '../api/axios'

// GET /clients (USER + ADMIN)
export async function getClients() {
  const res = await api.get('/clients')
  return res.data
}

//  POST /clients (ADMIN)
export async function createClient(payload) {
  // payload attendu (ex) : { nom, email, telephone }
  const res = await api.post('/clients', payload)
  return res.data
}

// PUT /clients/{id} (ADMIN)
export async function updateClient(id, payload) {
  const res = await api.put(`/clients/${id}`, payload)
  return res.data
}

// DELETE /clients/{id} (ADMIN)
export async function deleteClient(id) {
  const res = await api.delete(`/clients/${id}`)
  return res.data
}
