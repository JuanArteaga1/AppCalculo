import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
// El backend se alcanza por /api, igual que en producción.
const proxy = { '/api': process.env.BACKEND_URL || 'http://localhost:5100' };

export default defineConfig({
  server: { proxy },
  preview: { proxy },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
