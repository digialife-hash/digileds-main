import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  base: '/',
  build: {
    outDir: path.resolve(__dirname, '../Backend/public'),
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['qrcode'],
  },
  server: {
    proxy: {
      '/api/site-settings': 'http://localhost:7000',
      '/api': 'http://localhost:7000',
      '/uploads': 'http://localhost:7000',
      '/metrics': 'http://localhost:7000',
    },
  },
})
