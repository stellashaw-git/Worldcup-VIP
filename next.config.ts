import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    { source: "/city/:path*", destination: "/", permanent: false },
    { source: "/venue/:path*", destination: "/", permanent: false },
    { source: "/opportunity/:path*", destination: "/", permanent: false },
    { source: "/submit", destination: "/", permanent: false },
    { source: "/admin/review", destination: "/admin/leads", permanent: false },
    { source: "/admin/import", destination: "/admin/leads", permanent: false },
    { source: "/debug-official", destination: "/", permanent: false },
  ],
  ...(process.env.VERCEL
    ? {
        outputFileTracingExcludes: {
          "*": [
            ".playwright-browsers/**",
            "node_modules/playwright/**",
            "node_modules/playwright-core/**",
          ],
        },
      }
    : {
        serverExternalPackages: ["playwright", "playwright-core"],
      }),
};

export default nextConfig;
