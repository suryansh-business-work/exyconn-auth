import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for SPA routing
  base: '/',
  server: {
    port: 4001,
    host: true,
    strictPort: true,
    origin: 'http://0.0.0.0:4001'
  },
  preview: {
    allowedHosts: ['auth.exyconn.com'],
    port: 4001,
    host: true
  },
  build: {
    // Ensure assets are generated with correct paths
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})