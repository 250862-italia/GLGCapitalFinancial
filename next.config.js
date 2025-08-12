/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: true,
  },
  // Configurazione per export statico
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disabilita server-side features per export statico
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig
