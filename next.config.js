/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Disable all build checks
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  optimizeFonts: false,

  // Force dynamic rendering
  output: 'standalone',
  
  // Disable all static generation
  trailingSlash: false,
  staticPageGenerationTimeout: 0,

  // Minimal webpack config
  webpack: (config, { dev, isServer }) => {
    // Disable source maps in production
    if (!dev) {
      config.devtool = false;
    }
    
    // Disable module resolution fallbacks that cause fetch issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },

  // Disable all experimental features
  experimental: {
    esmExternals: false,
    optimizeCss: false,
    scrollRestoration: false,
  },
};

module.exports = nextConfig;
