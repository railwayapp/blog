const nextConfig = require("../next.config")

describe("markdown post rewrite", () => {
  it("runs before the dynamic HTML post route", async () => {
    const rewrites = await nextConfig.rewrites()

    expect(rewrites.beforeFiles).toContainEqual({
      source: "/p/:slug.md",
      destination: "/p/:slug/markdown",
    })
  })
})

describe("moved guide redirects", () => {
  it("permanently redirects every moved guide and the guides category", async () => {
    const movedGuides = require("../lib/moved-guides.json")
    const redirects = await nextConfig.redirects()

    expect(redirects).toContainEqual({
      source: "/guides",
      destination: "https://railway.com/guides",
      permanent: true,
    })
    for (const slug of movedGuides.slugs) {
      expect(redirects).toContainEqual({
        source: `/p/${slug}`,
        destination: `https://railway.com/guides/${slug}`,
        permanent: true,
      })
      expect(redirects).toContainEqual({
        source: `/p/${slug}.md`,
        destination: `https://railway.com/guides/${slug}.md`,
        permanent: true,
      })
    }
    expect(redirects.every((redirect) => redirect.permanent)).toBe(true)
  })
})
