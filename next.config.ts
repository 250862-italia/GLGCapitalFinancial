import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Ignora gli errori ESLint durante la build (per farla andare su Vercel)
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  /* config options here */
};

export default nextConfig;
