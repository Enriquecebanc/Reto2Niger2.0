import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",   // Permite acceder desde fuera del localhost
    port: 5173         // O el puerto que uses (por defecto 5173)
  }
})