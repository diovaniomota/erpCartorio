import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

// Disabled: workerd (Miniflare) crashes on Node.js v24 with std::terminate().
// Re-enable when using Node.js v22 LTS, or after wrangler/miniflare adds Node 24 support.
// if (process.env.NODE_ENV === "development") {
//   void import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
// }
