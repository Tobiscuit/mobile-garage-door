const { withPayload } = require('@payloadcms/next/withPayload')

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
}

module.exports = withPayload(nextConfig)
