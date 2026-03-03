/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['pino', 'graphql'],
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
        destination: '/dashboard',
      },
      {
        source: '/db/:path*',
        destination: '/dashboard/:path*',
      },
    ];
  },
}

export default nextConfig;
