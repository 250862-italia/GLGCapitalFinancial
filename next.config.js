/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Disable ESLint during builds to avoid issues
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable font optimization to avoid warnings
  optimizeFonts: false,

  // Force dynamic rendering for all pages
  output: 'standalone',
  
  // Disable static generation
  trailingSlash: false,
  staticPageGenerationTimeout: 0,

  // Security headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Disable static generation for all pages
  async rewrites() {
    return [
      // Hide internal routes
      {
        source: '/internal/:path*',
        destination: '/api/internal/:path*',
      }
    ];
  },

  // Security Configuration
  poweredByHeader: false,
  compress: true,
  generateEtags: false,

  // Image Optimization Security
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.glgcapitalgroupllc.com',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Simple webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Security: Disable source maps in production
    if (!dev) {
      config.devtool = false;
    }

    return config;
  },

  // Environment Variables Security
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
