import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build into a custom directory to avoid permission issues with existing .next
  distDir: ".next-local",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
