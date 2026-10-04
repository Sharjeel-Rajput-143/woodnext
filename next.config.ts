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
  },
};

export default nextConfig;
