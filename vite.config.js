import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ['./test/setupTests.js']
  },
  resolve: {
    alias: {
      'cm-chessboard': 'cm-chessboard'
    }
  },
  optimizeDeps: {
    include: ['cm-chessboard'],
    exclude: []
  }
})
