import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: '/',
  cacheDir: 'node_modules/.vite-5176',
  server: {
    host: '0.0.0.0',
    port: 5176,
    hmr: {
      host: 'localhost',
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4176,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      external: ['motion/react', 'recharts', 'lucide-react'],
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          animation: ['motion', 'gsap', '@gsap/react', 'lenis'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
}))
