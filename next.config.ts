import type { NextConfig } from "next";

const securityHeaders = [
  // {
  //   key: "Content-Security-Policy",
  //   value: [
  //     "default-src 'self'",
  //     "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://fundingchoicesmessages.google.com 'sha256-Am7bIQNYGtOBwCDBkRu6u9RrSm3a87vYJk/0Ic9SrIE='",
  //     "style-src 'self' 'unsafe-inline'",
  //     "img-src 'self' data: https://cdn.tengra.studio",
  //     "font-src 'self' https://tengra.studio https://cdn.tengra.studio data:",
  //     "connect-src 'self' https://cdn.tengra.studio https://tengra.studio https://static.cloudflareinsights.com https://cloudflareinsights.com https://*.cloudflareinsights.com https://fundingchoicesmessages.google.com",
  //     "frame-ancestors 'none'",
  //     "form-action 'self'",
  //     "base-uri 'self'",
  //     "object-src 'none'",
  //     "upgrade-insecure-requests",
  //   ].join("; "),
  // },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
  { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "geolocation=(), microphone=(), camera=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()",
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
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
  htmlLimitedBots: /.*/,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
