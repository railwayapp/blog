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

describe("llms-full.txt alias", () => {
  it("serves the full-text corpus at the conventional path", async () => {
    const rewrites = await nextConfig.rewrites()

    expect(rewrites.beforeFiles).toContainEqual({
      source: "/llms-full.txt",
      destination: "/llms-blog.md",
    })
  })
})
