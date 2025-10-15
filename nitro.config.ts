import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
  preset: 'vercel',

  // Public assets are served via CDN from .vercel/output/static/
  // NOT bundled in serverless functions
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
      // Exclude large assets from serverless function bundles
      functions: {
        '**': {
          excludeFiles: '{360_photos_compressed/**,360_photos_group/**,360_photos_original/**,ara_logos/**,campus_map/**,svg/**}'
        }
      }
    }
  }
})
