import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    plugins: [react() as any], // cast to avoid dual-vite type mismatch
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client/src'),
        '@shared': path.resolve(__dirname, 'shared')
      }
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: 'client/src/tests/setupTests.ts',
      include: [
        'client/src/__tests__/**/*.{test,spec}.{ts,tsx}',
        'src/__tests__/**/*.{test,spec}.{ts,tsx}'
      ],
      css: false,
      env: { NODE_ENV: 'test' }
    }
  };
});
