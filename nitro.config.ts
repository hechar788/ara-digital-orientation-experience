import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
  preset: 'vercel',

  // Public assets are served via CDN from .vercel/output/static/
  // NOT bundled in serverless functions
  // Note: 360_photos_original/ and 360_photos_group/ are already excluded via .gitignore
  publicAssets: [
    {
      baseURL: '/',
      dir: 'public',
      maxAge: 60 * 60 * 24 * 365 // 1 year cache
    }
  ],

  // Vercel-specific configuration
  vercel: {
    config: {
      // Exclude all large static assets from serverless function bundles
      functions: {
        '**': {
          excludeFiles: '{360_photos_compressed/**,ara_logos/**,campus_map/**,svg/**}'
        }
      }
    }
  }
})
