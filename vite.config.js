import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    outDir: "dist",
  },

  server: {
    host: true, // allows access from phone browser too
    port: 5173,

    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem')),
    },

    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://localhost:5000',
        changeOrigin: true,
        secure: false, // because it's local SSL
      },
    }
  },
})
