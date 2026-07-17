import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/server/**', 'node_modules', 'dist', '.astro'],
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
  },
});
