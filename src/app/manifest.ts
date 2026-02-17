import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mobile Garage Door Admin',
    short_name: 'MGD Admin',
    description: 'BOS for Mobile Garage Door',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#1a1a1a',
    theme_color: '#f1c40f',
    icons: [
      {
        src: '/icon.png', // We need to ensure these exist, or use placeholders
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
