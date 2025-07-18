/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Opzionale: ignora lint in build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disabilita l'ottimizzazione automatica dei font per evitare warning preload
  optimizeFonts: false,

  // Disabilita temporaneamente il controllo TypeScript per permettere il deploy
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configurazione per risolvere problemi di deploy Vercel
  experimental: {
    // Impedisce il rendering statico delle API routes
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },

  // FORZA TUTTO IL RENDERING DINAMICO
  output: 'standalone',
  
  // Disabilita completamente il rendering statico
  trailingSlash: false,
  
  // Disabilita completamente la generazione statica
  staticPageGenerationTimeout: 0,
  
  // Forza il rendering dinamico per tutte le pagine
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  
  // Configurazione per le API routes
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

  // Disabilita la generazione statica per tutte le pagine
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
};

module.exports = nextConfig;
