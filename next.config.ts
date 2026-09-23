import type { NextConfig } from "next";

// PostHog is proxied through /vx-signal so its scripts and events are
// first-party. The path is deliberately non-obvious: blockers match common
// proxy paths such as /ingest or /analytics. Assets live on the matching
// "-assets" host (us.i.posthog.com -> us-assets.i.posthog.com).
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const posthogAssetsHost = posthogHost.replace(/\/\/(\w+)\.i\./, "//$1-assets.i.");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async rewrites() {
    return [
      { source: "/vx-signal/static/:path*", destination: `${posthogAssetsHost}/static/:path*` },
      { source: "/vx-signal/array/:path*", destination: `${posthogAssetsHost}/array/:path*` },
      { source: "/vx-signal/:path*", destination: `${posthogHost}/:path*` },
    ];
  },
  // PostHog API paths end with a trailing slash.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
