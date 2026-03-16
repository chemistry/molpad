import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@chemistry/elements',
        '@chemistry/molecule',
        'zustand',
        'zustand/middleware',
      ],
      output: {
        assetFileNames: 'molpad.[ext]',
        manualChunks: undefined,
      },
    },
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: true,
    // Inline SVG icons into CSS as data URLs so consumers don't need separate assets
    assetsInlineLimit: 10000,
  },
});
