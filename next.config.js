const { withPayload } = require('@payloadcms/next/withPayload')

const nextConfig = {
  output: 'standalone',
  cacheComponents: true,
  reactStrictMode: true,
}

module.exports = withPayload(nextConfig)
