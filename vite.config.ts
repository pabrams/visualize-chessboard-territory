
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    headers: {
      'Cache-Control': 'no-store',
    },
    watch: {
      usePolling: true,
    }
  },
  test: {
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    reporters: [
      ['default', { summary: false }]
    ],
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.js',
    css: {
      modules: {
        classNameStrategy: 'non-scoped'
      }
    },
    // Mock CSS and static assets
    testTransformMode: {
      web: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js', '**/*.css'],
      ssr: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js']
    },
    mockReset: true,
    clearMocks: true,
    restoreMocks: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('test')
  }

})
