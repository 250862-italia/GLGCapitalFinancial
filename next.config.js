/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Opzionale: ignora lint in build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Security Headers Configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy - More permissive for development
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "media-src 'self'",
              "connect-src 'self' https://api.glgcapitalgroupllc.com https://www.google-analytics.com https://dobjulfwktzltpvqtxbql.supabase.co https://*.supabase.co",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // HTTP Strict Transport Security
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          // X-Frame-Options
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // X-Content-Type-Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // X-XSS-Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
          }
        ]
      },
      // Additional security for admin routes
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet'
          }
        ]
      }
    ]
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

  // Webpack Security Configuration
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

  // Rewrites for Security
  async rewrites() {
    return [
      // Hide internal routes
      {
        source: '/internal/:path*',
        destination: '/api/internal/:path*',
      }
    ]
  }
}

const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
  ...nextConfig
};
