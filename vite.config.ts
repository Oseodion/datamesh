import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [wasm(), topLevelAwait(), react()],
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: ['@shelby-protocol/sdk', '@shelby-protocol/clay-codes'],
  },
})
