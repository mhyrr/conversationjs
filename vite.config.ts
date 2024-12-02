import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : '/conversationjs/',
  server: {
    proxy: {
      '/auth/token': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})) 