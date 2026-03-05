import axios from 'axios'

const api = axios.create({
  baseURL: 'http://35.180.252.153:8081',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api