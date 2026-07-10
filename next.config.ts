import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    // Placeholder seed assets (src/data/seed.ts) are local SVGs until the site
    // owner supplies real photos/covers; Sanity-served images are raster
    // (JPEG/WebP) so this stays scoped to local dev placeholders.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
