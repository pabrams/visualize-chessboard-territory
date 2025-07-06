
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  test: {
    reporters: ['basic'],
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.js',
    css: {
      modules: {
        classNameStrategy: 'non-scoped'
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