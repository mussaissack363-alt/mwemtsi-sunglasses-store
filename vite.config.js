import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mwemtsi-sunglasses-store/', // GitHub Pages project subpath
  server: { host: '0.0.0.0', port: 5173 },
  optimizeDeps: {
    // Both entries so dev pre-bundles share ONE Three.js instance —
    // 'three/addons/...' bundled separately re-evaluates the three module
    // and triggers "WARNING: Multiple instances of Three.js being imported."
    include: ['three', 'three/addons/loaders/GLTFLoader.js'],
  },
})
