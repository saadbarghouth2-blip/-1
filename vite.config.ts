import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const basePath = env.VITE_BASE_PATH?.trim()
  const base = !basePath || basePath === '/'
    ? '/'
    : basePath.startsWith('/')
      ? (basePath.endsWith('/') ? basePath : `${basePath}/`)
      : `/${basePath}${basePath.endsWith('/') ? '' : '/'}`

  return {
    base,
    plugins: [mode === 'development' ? inspectAttr() : null, react()].filter(Boolean),
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            icons: ['lucide-react'],
            ui: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-popover',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-tooltip',
            ],
            products: ['./src/data/products.ts'],
          },
        },
      },
    },
    resolve: {
      alias: {
        "@riq/shared": path.resolve(__dirname, "./packages/shared/src/index.ts"),
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
});
