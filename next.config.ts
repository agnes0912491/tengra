import type { NextConfig } from "next"; 

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["react", "next"],
    serverSourceMaps: false,
  },
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  poweredByHeader: false,
};

export default nextConfig;
