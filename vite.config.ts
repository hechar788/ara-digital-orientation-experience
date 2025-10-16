import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const isVitest = process.env.VITEST === 'true'

const config = defineConfig({
  publicDir: process.env.VERCEL ? false : 'public',
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json']
    }),
    tanstackStart({
      srcDirectory: 'src'
    }),
    !isVitest &&
      nitro({
        config: {
          preset: 'vercel'
        }
      }),
    react(),
    tailwindcss()
  ].filter(Boolean)
})

export default config
