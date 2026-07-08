import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'GecxComponents',
      fileName: (format) =>
        format === 'umd' ? 'gecx-components.umd.cjs' : 'gecx-components.js',
      formats: ['es', 'umd'],
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
  },
});
