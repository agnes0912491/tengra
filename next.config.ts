import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["react", "next"]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
