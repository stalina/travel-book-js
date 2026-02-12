import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/travel-book-js/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/api/opentopo': {
        target: 'https://api.opentopodata.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/opentopo/, ''),
        secure: true,
      }
    }
  },
  build: { target: 'esnext' }
})
