import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // visualizer({ open: true, filename: 'stats.html' })
  ],
  server: {
    host: true
  },
  build: {
    minify: 'terser',
    terserOptions: {
      format: {
        ascii_only: true,
      },
    },
  },
})