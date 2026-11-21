import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [react()],
  resolve: {dedupe:['react','react-dom']},
  build: {outDir:'dist', emptyOutDir:true},
});
