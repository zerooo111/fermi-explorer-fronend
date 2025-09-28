/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { resolve } from 'path'
import { fileURLToPath, URL } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Default values
  const DEV_PORT = parseInt(env.VITE_DEV_PORT || '5173')
  const PREVIEW_PORT = parseInt(env.VITE_PREVIEW_PORT || '4173')

  return {
    plugins: [viteReact(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
    },
    server: {
      port: DEV_PORT,
      host: true, // Allow external connections
    },
    preview: {
      port: PREVIEW_PORT,
      host: true, // Allow external connections
    },
  }
})
