import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
}

export default withPayload(nextConfig)
