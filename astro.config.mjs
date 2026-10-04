import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        '@ai-detector/shared': path.resolve(__dirname, './packages/shared/src/index.ts'),
        '@ai-detector/core': path.resolve(__dirname, './packages/core/src/index.ts'),
        '@ai-detector/file-processing': path.resolve(__dirname, './packages/file-processing/src/index.ts'),
      },
    },
    ssr: {
      external: ['node:buffer', 'node:stream', 'node:util'],
    },
  },
});
