import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    reporters: [['default', { summary: false }]],
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.js',
    css: {
      modules: {
        classNameStrategy: 'non-scoped'
      }
    },
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
});
