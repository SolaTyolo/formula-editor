import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'formula-edit-lark': resolve(__dirname, 'packages/formula-edit-lark/src/index.ts'),
    },
  },
  test: {
    include: [
      'packages/formula-edit-lark/src/**/*.test.ts',
      'example/src/**/*.test.ts',
    ],
    environment: 'node',
    passWithNoTests: false,
  },
});
