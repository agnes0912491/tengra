import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["react", "next"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-toastify": path.join(__dirname, "src/lib/react-toastify"),
    };

    return config;
  },
};

export default nextConfig;
