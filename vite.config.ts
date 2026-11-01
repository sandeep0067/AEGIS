import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      writeBundle() {
        const distDir = resolve(__dirname, 'dist')
        if (!existsSync(distDir)) {
          mkdirSync(distDir, { recursive: true })
        }
        copyFileSync(
          resolve(__dirname, 'manifest.json'),
          resolve(distDir, 'manifest.json')
        )
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'background.js'
          if (chunkInfo.name === 'content') return 'content.js'
          return 'assets/[name].js'
        },
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.html') return 'index.html'
          if (assetInfo.name?.endsWith('.svg')) return 'icons/[name][extname]'
          return 'assets/[name][extname]'
        }
      }
    }
  },
  publicDir: 'public'
})
