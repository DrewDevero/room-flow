import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves project sites from /<repo-name>/, so the built asset
  // paths need that prefix; the dev server still runs at the domain root.
  base: command === 'build' ? '/room-flow/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
}))
