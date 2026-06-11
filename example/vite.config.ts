import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const libRoot = resolve(__dirname, '../packages/formula-edit-lark');

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      'formula-edit-lark': resolve(libRoot, 'src/index.ts'),
    },
  },
});
