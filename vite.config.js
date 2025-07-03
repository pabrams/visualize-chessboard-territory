import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  test: {
    reporter: ['basic'],
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.js',
    css: true,
  },
  resolve: {
    alias: [
      // Main chessboard import - point to the actual entry point
      {
        find: /^cm-chessboard$/,
        replacement: path.resolve(__dirname, 'node_modules/cm-chessboard/src/Chessboard.js')
      },
      // Handle sub-path imports
      {
        find: /^cm-chessboard\/(.*)$/,
        replacement: path.resolve(__dirname, 'node_modules/cm-chessboard/$1')
      }
    ]
  },
})