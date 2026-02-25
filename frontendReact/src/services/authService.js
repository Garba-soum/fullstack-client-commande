import api from '../api/axios'

// login -> POST /auth/login
export async function loginRequest(credentials) {
  // credentials: { username/email, password }
  const res = await api.post('/auth/login', credentials)
  return res.data
}

//  register -> POST /auth/register
export async function registerRequest(payload) {
  const res = await api.post('/auth/register', payload)
  return res.data
}

// register-admin -> POST /auth/register-admin (ADMIN only)
export async function registerAdminRequest(payload) {
  const res = await api.post('/auth/register-admin', payload)
  return res.data
}
