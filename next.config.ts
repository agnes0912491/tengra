import type { NextConfig } from "next"; 

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["react", "next"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
