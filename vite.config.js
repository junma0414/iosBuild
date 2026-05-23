import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: '.',
  logLevel: 'error',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', '@tanstack/react-query', '@capacitor/core', '@capacitor/browser', '@capacitor/app'],
    force: true,
  },
  ssr: {
    noExternal: ['@capacitor/core', '@capacitor/browser', '@capacitor/app', '@capacitor/device', '@capacitor/preferences', '@capacitor/share'],
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      allow: ['..']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})