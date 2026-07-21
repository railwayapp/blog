import { buildMetaDescription, buildSeoTitle } from "../lib/seo-components"

describe("buildMetaDescription", () => {
  it("returns undefined for null input", () => {
    expect(buildMetaDescription(null)).toBeUndefined()
  })

  it("returns undefined for empty string", () => {
    expect(buildMetaDescription("")).toBeUndefined()
  })

  it("returns undefined for whitespace-only string", () => {
    expect(buildMetaDescription("   ")).toBeUndefined()
  })

  it("returns the description unchanged when under 160 chars", () => {
    const short = "Deploy your app to Railway in seconds."
    expect(buildMetaDescription(short)).toBe(short)
  })

  it("returns the description unchanged at exactly 160 chars", () => {
    const exact = "a".repeat(160)
    expect(buildMetaDescription(exact)).toBe(exact)
  })

  it("truncates at the nearest word boundary with an ellipsis", () => {
    const long =
      "Railway is a modern cloud platform that makes it easy to deploy your applications, databases, and infrastructure. It provides automatic scaling, monitoring, and more for production workloads."
    const result = buildMetaDescription(long)!
    expect(result.length).toBeLessThanOrEqual(160)
    expect(result).toMatch(/…$/)
    // Must not break mid-word
    expect(result.slice(0, -1)).not.toMatch(/\S$/)
  })

  it("normalizes internal whitespace runs", () => {
    expect(buildMetaDescription("Deploy  your   app")).toBe("Deploy your app")
  })
})

describe("buildSeoTitle", () => {
  it("returns undefined for null input", () => {
    expect(buildSeoTitle(null)).toBeUndefined()
  })

  it("returns undefined for empty string", () => {
    expect(buildSeoTitle("")).toBeUndefined()
  })

  it("appends ' | Railway Blog' to a plain title", () => {
    expect(buildSeoTitle("How to Deploy a Node App")).toBe(
      "How to Deploy a Node App | Railway Blog"
    )
  })

  it("does not double-append when the title already contains 'Railway'", () => {
    expect(buildSeoTitle("Why Railway is Great")).toBe("Why Railway is Great")
  })

  it("is case-insensitive when checking for Railway", () => {
    expect(buildSeoTitle("Deploy on RAILWAY")).toBe("Deploy on RAILWAY")
  })

  it("trims surrounding whitespace", () => {
    expect(buildSeoTitle("  Hello World  ")).toBe(
      "Hello World | Railway Blog"
    )
  })
})
