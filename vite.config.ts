import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Jiukisidian/',
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('tldraw')) {
              return 'tldraw'
            }
            if (id.includes('@tiptap')) {
              return 'tiptap'
            }
            if (id.includes('react') || id.includes('lucide')) {
              return 'vendor'
            }
          }
        },
      },
    },
  },
})