import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mobile Garage Door',
    short_name: 'Garage Door',
    description: 'Premier Mobile Garage Door Service and Dispatch Application',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a', // Tailwind slate-900 (matches dark theme)
    theme_color: '#1e293b',      // Tailwind slate-800
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
