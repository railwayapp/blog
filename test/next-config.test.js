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
