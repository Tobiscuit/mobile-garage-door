const { withPayload } = require('@payloadcms/next/withPayload')

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
}

module.exports = withPayload(nextConfig)
