import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  build: {
    // Aggressive minification for smaller bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Chunk splitting strategy
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries in separate chunk
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          // Icons library separate chunk
          'icons': ['lucide-react'],
          // API calls separate chunk
          'api': ['axios'],
        },
        // Optimize chunk names
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimize CSS
    cssCodeSplit: true,
    sourcemap: false,
    // Increase chunk size warning threshold (we're optimizing anyway)
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dev server
  server: {
    middlewareMode: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5174,
    },
  },
})
