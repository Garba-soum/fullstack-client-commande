import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        //  utile si backend attend Host=localhost:8080
        // headers: { host: 'localhost:8080' },
      },
      '/clients': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/commandes': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
