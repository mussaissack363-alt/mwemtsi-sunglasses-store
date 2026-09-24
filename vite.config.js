import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mwemtsi-sunglasses-store/', // GitHub Pages project subpath
  server: { host: '0.0.0.0', port: 5173 },
  optimizeDeps: {
    include: [
      'three',
      'three/addons/loaders/GLTFLoader.js',
      'three/examples/jsm/loaders/DRACOLoader.js',
    ],
  },
})
