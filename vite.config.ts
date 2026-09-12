import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves project sites from /<repo-name>/, so the built asset
  // paths need that prefix; the dev server still runs at the domain root.
  base: command === 'build' ? '/room-flow/' : '/',
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[/\\](react|react-dom|scheduler)[/\\]/,
            },
            {
              name: 'vendor-r3f',
              test: /node_modules[/\\]@react-three[/\\]/,
              maxSize: 450 * 1024,
            },
            {
              name: 'vendor-three',
              test: /node_modules[/\\]three[/\\]/,
              maxSize: 450 * 1024,
            },
            {
              name: 'vendor-konva',
              test: /node_modules[/\\](konva|react-konva)[/\\]/,
            },
            {
              name: 'vendor-state',
              test: /node_modules[/\\](zustand|immer|zundo|zod|uuid|use-image)[/\\]/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
}))
