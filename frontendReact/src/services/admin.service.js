import api from '../api/axios'

export async function fetchUsers() {
  const res = await api.get('/admin/users')
  return res.data 
}

export async function createUser(payload) {
  const res = await api.post('/auth/register', payload)
  return res.data
}

export async function createAdmin(payload) {
  const res = await api.post('/auth/register-admin', payload)
  return res.data
}

export async function deleteUser(userId) {
  const res = await api.delete(`/admin/users/${userId}`)
  return res.data
}
