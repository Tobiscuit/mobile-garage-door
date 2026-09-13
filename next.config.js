/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Render page metadata (title, description, canonical, hreflang, Open Graph)
  // in the initial <head> for every user agent instead of streaming it into
  // the body. By default vinext, like Next.js, only does that for a fixed list
  // of "HTML-limited" bots, which omits AI search crawlers; Google only honours
  // a canonical inside <head>. /.*/ is the documented way to disable streaming
  // metadata. See specs/002-design-refresh/seo.md §2.
  htmlLimitedBots: /.*/,
  serverExternalPackages: ['pino', 'graphql'],
  images: {
    unoptimized: true,
  },
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
