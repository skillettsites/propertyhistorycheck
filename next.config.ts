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
      // Removed public page — 301 to the policy that now covers it so any
      // stale crawl/backlink lands somewhere valid instead of a 404.
      { source: "/refunds", destination: "/terms", permanent: true },
      // Legacy /schools/[town] URLs Google still crawls but that never had a
      // town-guide+schools dataset (not in towns.json; Newport is Wales so
      // Ofsted/GIAS has no real data). 301 to the live town page instead of
      // 404. Added 2026-06-18.
      { source: "/schools/ilford", destination: "/town/ilford", permanent: true },
      { source: "/schools/st-albans", destination: "/town/st-albans", permanent: true },
      { source: "/schools/guildford", destination: "/town/guildford", permanent: true },
      { source: "/schools/newport", destination: "/town/newport", permanent: true },
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
