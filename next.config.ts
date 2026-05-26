import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Canonicalise to www: apex 301 -> www so only one host serves 200
      // (matches the canonical tag, which Google was overriding to apex).
      {
        source: "/:path*",
        has: [{ type: "host", value: "homebuyercheck.co.uk" }],
        destination: "https://www.homebuyercheck.co.uk/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/((?!api|r|checkout).*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=86400, stale-while-revalidate=43200" },
        ],
      },
      {
        source: "/r/(.*)",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
