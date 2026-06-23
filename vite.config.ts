import { defineConfig, type ViteDevServer, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import fs from 'fs'
import { createRequire } from 'module'
import type { IncomingMessage, ServerResponse } from 'http'

const require = createRequire(import.meta.url)
const clayCodesDir = path.dirname(require.resolve('@shelby-protocol/clay-codes/clay.wasm'))
const clayWasmSource = path.join(clayCodesDir, 'clay.wasm')

function serveClayWasm(): Plugin {
  return {
    name: 'serve-clay-wasm',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.url?.endsWith('clay.wasm')) {
          res.setHeader('Content-Type', 'application/wasm')
          fs.createReadStream(clayWasmSource).pipe(res)
          return
        }
        next()
      })
    },
  }
}

function copyClayWasm(): Plugin {
  return {
    name: 'copy-clay-wasm',
    buildStart() {
      const dest = path.resolve(__dirname, 'public/clay.wasm')
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(clayWasmSource, dest)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
    serveClayWasm(),
    copyClayWasm(),
  ],
})
