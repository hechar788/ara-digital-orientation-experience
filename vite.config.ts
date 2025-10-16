import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  // Enable public directory for development only, Nitro handles production static assets
  // Setting to false for Vercel builds prevents the 250 MB serverless function limit
  // VERCEL env var is automatically set by Vercel during builds
  publicDir: process.env.VERCEL ? false : 'public',

  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({
      srcDirectory: 'src',
    }),
    // Nitro plugin for Vercel deployment
    nitro({
      config: {
        preset: 'vercel',
      },
    }),
    react(),
    tailwindcss(),
  ],
})

export default config
