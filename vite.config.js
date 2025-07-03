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
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
        localsConvention: 'camelCase'
      }
    },
    // Mock CSS and static assets
    transformMode: {
      web: [/\.[jt]sx?$/, /\.css$/],
      ssr: [/\.[jt]sx?$/]
    },
    deps: {
      external: ['react-chessboard/dist/chessboard.css'],
      inline: ['react-chessboard']
    },
    mockReset: true,
    clearMocks: true,
    restoreMocks: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('test')
  }

})