import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
