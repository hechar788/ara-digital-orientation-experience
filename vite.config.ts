import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  // Disable copying public directory - Nitro will handle static assets
  publicDir: false,

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
