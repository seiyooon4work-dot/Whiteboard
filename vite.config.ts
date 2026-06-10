import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// GitHub Pages 배포 기본 경로
// 저장소 이름: HAFS-Eureka-Research-Project
// Pages URL: https://inseoji219-eng.github.io/HAFS-Eureka-Research-Project/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Whiteboard/' : '/',
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
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          animation: ['motion', 'gsap', '@gsap/react', 'lenis'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          charts: ['recharts'],
        },
      },
    },
  },
}))
