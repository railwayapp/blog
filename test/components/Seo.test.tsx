import React from "react"
import { render } from "../testUtils"
import SEO, { serializeSchema } from "@components/Seo"
import { BlogPost } from "@lib/types"

// Inline next/head children so the component's own head output is assertable,
// and capture the props handed to next-seo (which owns title/description/
// canonical/og emission — the component must not duplicate them).
jest.mock("next/head", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockNextSeoCalls: Record<string, unknown>[] = []
jest.mock("next-seo", () => ({
  __esModule: true,
  DefaultSeo: () => null,
  NextSeo: (props: Record<string, unknown>) => {
    mockNextSeoCalls.push(props)
    return null
  },
}))

const post: BlogPost = {
  id: "1",
  slug: "scaling-railway",
  title: "Scaling Railway",
  description: "How we scale Railway.",
  content: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  publishedAt: "2026-01-02T00:00:00.000Z",
  updatedAt: "2026-01-03T00:00:00.000Z",
  featured: false,
  externalAuthor: false,
  featuredImage: null,
  socialImage: null,
  authors: [{ id: "a1", name: "Mahmoud", avatar: null, avatarUrl: null }],
  category: { id: "c1", slug: "engineering", title: "Engineering" },
}

const postUrl = "https://blog.railway.com/p/scaling-railway"

beforeEach(() => {
  mockNextSeoCalls.length = 0
})

describe("SEO head shape", () => {
  it("emits article OpenGraph data via next-seo even when the post has no image", () => {
    render(
      <SEO
        title={post.title}
        description={post.description}
        post={post}
        currentUrl={postUrl}
      />
    )

    expect(mockNextSeoCalls).toHaveLength(1)
    const props = mockNextSeoCalls[0] as {
      description?: string
      canonical?: string
      openGraph?: {
        url?: string
        type?: string
        images?: { url: string }[]
        article?: {
          authors?: string[]
          publishedTime?: string
          modifiedTime?: string
          section?: string
        }
      }
    }

    expect(props.description).toBe(post.description)
    expect(props.canonical).toBe(postUrl)
    expect(props.openGraph?.url).toBe(postUrl)
    // type:"article" is required or next-seo silently drops the article block
    expect(props.openGraph?.type).toBe("article")
    expect(props.openGraph?.article?.publishedTime).toBe(post.publishedAt)
    expect(props.openGraph?.article?.modifiedTime).toBe(post.updatedAt)
    expect(props.openGraph?.article?.section).toBe("Engineering")
    expect(props.openGraph?.article?.authors).toEqual(["Mahmoud"])
    expect(props.openGraph?.images).toBeUndefined()
  })

  it("passes og images independently of the article block", () => {
    render(
      <SEO
        title="Railway Blog"
        image="https://og.railway.com/api/image?x=1"
        currentUrl="https://blog.railway.com"
      />
    )

    const props = mockNextSeoCalls[0] as {
      openGraph?: { type?: string; images?: { url: string }[]; article?: unknown }
    }
    expect(props.openGraph?.images).toEqual([
      { url: "https://og.railway.com/api/image?x=1" },
    ])
    // no post → no article semantics
    expect(props.openGraph?.type).toBeUndefined()
    expect(props.openGraph?.article).toBeUndefined()
  })

  it("renders no head tags of its own besides JSON-LD (no duplicate description/canonical/title/article)", () => {
    const { container } = render(
      <SEO
        title={post.title}
        description={post.description}
        post={post}
        content={"## Why scale?\n\nBecause growth."}
        currentUrl={postUrl}
      />
    )

    expect(container.querySelector("title")).toBeNull()
    expect(container.querySelector('meta[name="description"]')).toBeNull()
    expect(container.querySelector('link[rel="canonical"]')).toBeNull()
    expect(container.querySelector('meta[property^="article:"]')).toBeNull()
    expect(container.querySelector('meta[property^="og:"]')).toBeNull()

    const scripts = Array.from(
      container.querySelectorAll('script[type="application/ld+json"]')
    )
    const types = scripts
      .map((s) => JSON.parse(s.textContent ?? "{}")["@type"])
      .sort()
    expect(types).toEqual(["BlogPosting", "BreadcrumbList", "FAQPage"])
  })

  it("emits only BlogPosting and BreadcrumbList JSON-LD when content has no FAQs", () => {
    const { container } = render(
      <SEO title={post.title} description={post.description} post={post} currentUrl={postUrl} />
    )

    const types = Array.from(
      container.querySelectorAll('script[type="application/ld+json"]')
    )
      .map((s) => JSON.parse(s.textContent ?? "{}")["@type"])
      .sort()
    expect(types).toEqual(["BlogPosting", "BreadcrumbList"])
  })
})

describe("serializeSchema", () => {
  it("escapes < so CMS strings cannot close the JSON-LD script tag", () => {
    const schema = {
      "@type": "BlogPosting",
      headline: 'Evil</script><script>alert("xss")</script>',
    }

    const out = serializeSchema(schema)

    expect(out).not.toContain("</script>")
    expect(out).not.toContain("<")
  })

  it("round-trips to identical JSON for crawlers", () => {
    const schema = {
      headline: "</script> & <b>bold</b>",
      answer: "1 < 2 > 0",
    }

    expect(JSON.parse(serializeSchema(schema))).toEqual(schema)
  })

  it("leaves ordinary schemas byte-identical to JSON.stringify", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "Scaling Railway",
      datePublished: "2026-06-04T00:00:00.000Z",
    }

    expect(serializeSchema(schema)).toBe(JSON.stringify(schema))
  })
})
