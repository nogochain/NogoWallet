import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'web',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'core/src'),
      '@adapter': path.resolve(__dirname, 'adapter/src'),
      '@service': path.resolve(__dirname, 'service/src')
    }
  },
  server: {
    port: 5174,
    strictPort: true,
    host: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
