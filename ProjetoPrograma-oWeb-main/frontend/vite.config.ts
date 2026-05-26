import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@db': path.resolve(__dirname, '../database'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
})
