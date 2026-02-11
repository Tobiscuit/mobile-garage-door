import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/db',
        destination: '/admin',
      },
      {
        source: '/db/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
}

export default withPayload(nextConfig)
