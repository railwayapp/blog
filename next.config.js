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
        // /llms-full.txt is the conventional name tools look for; serve the
        // full-text corpus there too (llms-blog.md stays for existing links).
        {
          source: "/llms-full.txt",
          destination: "/llms-blog.md",
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
}
