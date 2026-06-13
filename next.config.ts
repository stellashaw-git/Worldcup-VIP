import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
