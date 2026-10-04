import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ai-detector/shared': path.resolve(import.meta.dirname, '../../packages/shared/src/index.ts'),
      '@ai-detector/core': path.resolve(import.meta.dirname, '../../packages/core/src/index.ts'),
    },
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
