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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.tengra.studio",
        pathname: "/**",
      },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
