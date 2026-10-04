import type { NextConfig } from "next";

// The live site address, used in WhatsApp messages. Set NEXT_PUBLIC_SITE_URL to override;
// on Vercel it is picked up automatically from the project's production domain.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "");

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_SITE_URL: siteUrl },
  // Don't generate AGENTS.md / CLAUDE.md into the project.
  agentRules: false,
  // The catalog and uploaded photos are read from disk at request time, so make sure they ship with the deployment.
  outputFileTracingIncludes: { "/**": ["./data/**/*"] },
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    // Cap the largest photo at 1920px wide (the default goes up to 3840px, which is far bigger than needed).
    deviceSizes: [360, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [96, 128, 256, 384],
  },
  async headers() {
    const cache = "public, max-age=86400, stale-while-revalidate=604800";
    return [
      {
        source: "/:file(logo-mark.png|icon.png|apple-icon.png|opengraph-image.jpg)",
        headers: [{ key: "Cache-Control", value: cache }],
      },
    ];
  },
};

export default nextConfig;
