import { getStaticProps as getPostStaticProps } from "../../pages/p/[slug]"
import { getStaticProps as getCategoryStaticProps } from "../../pages/[category]"
import { getCategories, getPostBySlug, getRelatedPosts } from "@lib/cms"

jest.mock("@lib/cms", () => ({
  ...jest.requireActual("@lib/cms"),
  getCategories: jest.fn(),
  getPostBySlug: jest.fn(),
  getPostsByCategorySlug: jest.fn(),
  getRelatedPosts: jest.fn(),
}))

// The page imports PostPage → Code, which pulls in shiki's ESM-only build;
// only getStaticProps is under test here.
jest.mock("@components/Code", () => ({
  Code: () => null,
}))

// Regression: a notFound result without revalidate is cached until the next
// deploy, and content ships without deploys — one request to a slug before
// its post is published would pin the URL at 404 forever.
describe("post page getStaticProps", () => {
  it("gives a missing post's 404 the same lease as the success path", async () => {
    ;(getPostBySlug as jest.Mock).mockResolvedValue(null)

    const result = await getPostStaticProps({
      params: { slug: "not-published-yet" },
    })

    expect(result).toEqual({ notFound: true, revalidate: 60 })
  })

  it("keeps the 60s lease on rendered posts", async () => {
    const post = { slug: "hello-world", category: null }
    ;(getPostBySlug as jest.Mock).mockResolvedValue(post)
    ;(getRelatedPosts as jest.Mock).mockResolvedValue([])

    const result = await getPostStaticProps({
      params: { slug: "hello-world" },
    })

    expect(result).toEqual({
      props: { page: post, relatedPosts: [] },
      revalidate: 60,
    })
  })
})

describe("category page getStaticProps", () => {
  it("gives an unknown category's 404 the same lease as the success path", async () => {
    ;(getCategories as jest.Mock).mockResolvedValue([])

    const result = await getCategoryStaticProps({
      params: { category: "not-created-yet" },
    })

    expect(result).toEqual({ notFound: true, revalidate: 900 })
  })
})
