import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vercel from 'vite-plugin-vercel'

export default defineConfig({
  plugins: [react(), vercel()],
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      // Proxy /api requests to Express backend (avoids CORS in dev)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Proxy Socket.io WebSocket upgrade
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
