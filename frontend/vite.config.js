/**
 * Vite configuration for the FEMS frontend.
 * Dev server proxies /api to the gateway so the SPA and API share an origin in
 * development (avoids CORS friction during local work).
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
