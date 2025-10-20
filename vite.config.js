import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Export Vite configuration.  When deployed on Vercel the environment
// variable VITE_API_BASE must be set to the backend URL.  During
// development this can be overridden via .env.local.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
});