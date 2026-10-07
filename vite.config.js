import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/NOBE-Capstone-Portfolio/',
  plugins: [react()],
  server: {
    watch: { usePolling: true },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
