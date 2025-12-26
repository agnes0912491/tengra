import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone",
  experimental: {
    serverSourceMaps: false,
    optimizeCss: true, // Inline critical CSS to reduce render-blocking resources
    optimizePackageImports: ["lucide-react", "framer-motion", "@tengra/language"],
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
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  htmlLimitedBots: /.*/,
  poweredByHeader: false,
  // Security headers are now handled by Nginx for better performance and consolidation
  // See /srv/tengra/packages/config/assets/nginx.conf
};

export default nextConfig;
