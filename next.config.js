const movedGuides = require("./lib/moved-guides.json")

// Guides moved to railway.com/guides. Permanent redirects pass their ranking
// to the new pages; the sitemap leaves the old URLs out.
const guideRedirects = [
  { source: "/guides", destination: movedGuides.destination, permanent: true },
  { source: "/guide", destination: movedGuides.destination, permanent: true },
  ...movedGuides.slugs.flatMap((slug) => [
    {
      source: `/p/${slug}`,
      destination: `${movedGuides.destination}/${slug}`,
      permanent: true,
    },
    {
      source: `/p/${slug}.md`,
      destination: `${movedGuides.destination}/${slug}.md`,
      permanent: true,
    },
  ]),
]

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "user-images.githubusercontent.com" },
      { protocol: "https", hostname: "og.railway.app" },
      { protocol: "https", hostname: "og.railway.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cms.railway.com" },
    ],
  },
  compress: true,
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  reactStrictMode: true,
  staticPageGenerationTimeout: 300,
  async redirects() {
    return guideRedirects
  },
  async rewrites() {
    return {
      // A dynamic page named `[slug].md` is compiled by Next with the same
      // route regex as `[slug]`, so `/p/example.md` is otherwise handled as an
      // HTML post whose slug is `example.md`. Rewrite before filesystem route
      // matching to keep the public `.md` URL while using an unambiguous page.
      beforeFiles: [
        {
          source: "/p/:slug.md",
          destination: "/p/:slug/markdown",
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
}
