import type { NextConfig } from "next";

// Security + tech-stack obfuscation headers
// Goal: nothing in the HTTP response should hint at the underlying tech stack.
const securityHeaders = [
  { key: "X-Content-Type-Options",   value: "nosniff" },
  { key: "X-Frame-Options",          value: "DENY" },
  { key: "X-XSS-Protection",         value: "1; mode=block" },
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Mask the server identifier — overrides any default
  { key: "Server", value: "VSI" },
];

const nextConfig: NextConfig = {
  // Disable Next.js dev overlay indicator badge
  devIndicators: false,

  // Disable Next.js's "X-Powered-By: Next.js" header
  poweredByHeader: false,

  // Standalone output produces a minimal, portable server bundle suitable for Docker
  output: "standalone",

  // Disable production source maps so client JS is not easily readable
  productionBrowserSourceMaps: false,

  // Don't reveal source maps to browsers
  experimental: {
    // No experimental features that might leak telemetry
  },

  // Hide build IDs and generator info
  generateBuildId: async () => {
    // Use a generic, opaque build id (timestamp-based, no semantic info)
    return `b${Date.now().toString(36)}`;
  },

  // React strict mode for prod
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Apply security headers to every route
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
    // Public-but-noindex pages: extra belt on top of <meta robots>
    {
      source: "/qa",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
    },
    {
      source: "/r/:token*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
    },
  ],
};

export default nextConfig;
