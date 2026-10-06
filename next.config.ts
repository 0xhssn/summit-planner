import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is off: every page here is per-user and reads cookies,
  // so prerendered static shells buy nothing and would require Suspense around every auth read.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
