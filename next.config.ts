import type { NextConfig } from "next";

// Prototype: every screen is client-rendered from mock data in localStorage,
// so Cache Components / partial prefetching are intentionally left off.
const nextConfig: NextConfig = {
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
