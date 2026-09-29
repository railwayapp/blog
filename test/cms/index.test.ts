/** @jest-environment node */
import {
  getCategories,
  getPostBySlug,
  getPosts,
  getPostsByCategorySlug,
  getRelatedPosts,
  mapCMSPost,
} from "@lib/cms"

const mockFetch = jest.fn()
const post = {
  id: 1,
  _status: "published" as const,
  slug: "hello",
  title: "Hello",
  description: "Description",
  publishedAt: "2026-09-29T00:00:00Z",
}
const category = { id: 7, title: "Guide", slug: "guide", visible: true }
const page = (
  docs: unknown[],
  hasNextPage = false,
  nextPage: number | null = null
) => ({
  ok: true,
  status: 200,
  json: async () => ({ data: { result: { docs, hasNextPage, nextPage } } }),
})
const request = (index = 0) => JSON.parse(mockFetch.mock.calls[index][1].body)

beforeEach(() => {
  mockFetch.mockReset()
  global.fetch = mockFetch
  process.env.CMS_API_URL = "https://cms.example/"
  process.env.CMS_API_KEY = "published-key"
})

it("paginates GraphQL lists while mapping authors, media, categories and blank SEO fields", async () => {
  const richPost = {
    ...post,
    seoTitle: " ",
    seoDescription: "",
    category,
    authors: [
      { id: 3, name: "Author", githubUrl: "https://github.com/author" },
    ],
    featuredImage: {
      id: 4,
      url: "https://cms.example/media/cover.png",
      alt: "Cover",
      width: 1200,
    },
  }
  mockFetch
    .mockResolvedValueOnce(page([richPost], true, 2))
    .mockResolvedValueOnce(page([{ ...post, id: 2, slug: "older" }]))

  const posts = await getPosts({ limit: 1 })
  expect(posts.map((item) => item.slug)).toEqual(["hello", "older"])
  expect(posts[0]).toMatchObject({
    id: "1",
    content: null,
    seoTitle: null,
    seoDescription: null,
    category: { id: "7", slug: "guide" },
    authors: [{ id: "3", avatarUrl: "https://github.com/author.png" }],
    featuredImage: { id: "4", alt: "Cover", width: 1200 },
  })
  expect(request(0)).toMatchObject({
    operationName: "BlogPosts",
    variables: {
      page: 1,
      limit: 1,
      sort: "-publishedAt",
      includeContent: false,
    },
  })
  expect(request(1).variables.page).toBe(2)
  expect(mockFetch.mock.calls[0][0].href).toBe(
    "https://cms.example/api/graphql"
  )
  expect(mockFetch.mock.calls[0][1]).toMatchObject({
    method: "POST",
    cache: "no-store",
    headers: { Authorization: "Bearer published-key", "X-CMS-Client": "blog" },
  })
})

it("requests content for feeds and exports with bounded pages and the requested sorting", async () => {
  mockFetch.mockResolvedValue(page([{ ...post, content: "# Markdown" }]))
  expect(
    await getPosts({ includeContent: true, limit: 50, sort: "publishedAt" })
  ).toMatchObject([{ content: "# Markdown" }])
  expect(request().variables).toMatchObject({
    includeContent: true,
    limit: 10,
    sort: "publishedAt",
  })
  expect(request().query).toContain("content @include(if: $includeContent)")
})

it("passes slugs as variables and combines filters with GraphQL AND", async () => {
  const slug = 'post-"quoted"'
  mockFetch.mockResolvedValue(page([{ ...post, slug, content: "Article" }]))
  expect(await getPostBySlug(slug)).toMatchObject({ slug, content: "Article" })
  expect(request().variables).toMatchObject({
    includeContent: true,
    limit: 1,
    where: {
      AND: [
        { _status: { equals: "published" }, archivedAt: { exists: false } },
        { slug: { equals: slug } },
      ],
    },
  })
  expect(request().query).not.toContain(slug)
})

it("returns null for missing posts and excludes drafts and archives even with a privileged key", async () => {
  mockFetch.mockResolvedValue(
    page([
      { ...post, _status: "draft" },
      { ...post, archivedAt: "2026-09-29" },
      { ...post, _status: null },
    ])
  )
  expect(await getPostBySlug("hello")).toBeNull()
})

it("paginates visible categories in CMS order", async () => {
  mockFetch
    .mockResolvedValueOnce(page([category], true, 2))
    .mockResolvedValueOnce(
      page([{ id: 8, title: "Engineering", slug: "engineering" }])
    )
  expect((await getCategories()).map((item) => item.slug)).toEqual([
    "guide",
    "engineering",
  ])
  expect(request()).toMatchObject({
    operationName: "BlogCategories",
    variables: { page: 1, limit: 100, where: { visible: { equals: true } } },
  })
  expect(request().query).toContain('sort: "order"')
  expect(request(1).variables.page).toBe(2)
})

it.each(["guides", "guide"])(
  "resolves %s to a category ID before fetching posts",
  async (slug) => {
    mockFetch
      .mockResolvedValueOnce(page([category]))
      .mockResolvedValueOnce(page([post]))
    expect(await getPostsByCategorySlug(slug)).toHaveLength(1)
    expect(request().variables.where).toEqual({ slug: { equals: "guide" } })
    expect(request(1).variables.where.AND[1]).toEqual({
      category: { equals: 7 },
    })
  }
)

it("returns no posts for a missing category without making a post query", async () => {
  mockFetch.mockResolvedValue(page([]))
  expect(await getPostsByCategorySlug("missing")).toEqual([])
  expect(mockFetch).toHaveBeenCalledTimes(1)
})

it("fetches related posts by the existing category ID and excludes the current post", async () => {
  mockFetch.mockResolvedValue(
    page([
      post,
      { ...post, id: 2, slug: "related" },
      { ...post, id: 3, slug: "another" },
    ])
  )
  const mapped = mapCMSPost({ ...post, category })
  expect((await getRelatedPosts(mapped, 1)).map((item) => item.slug)).toEqual([
    "related",
  ])
  expect(request().variables.where.AND[1]).toEqual({
    category: { equals: "7" },
  })
  expect(mockFetch).toHaveBeenCalledTimes(1)
})

it.each([
  { docs: null, hasNextPage: false },
  { docs: [] },
  { docs: [], hasNextPage: true, nextPage: 1 },
])(
  "rejects malformed pagination rather than silently caching an empty list",
  async (result) => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { result } }),
    })
    await expect(getPosts()).rejects.toThrow("Invalid CMS pagination response")
    expect(mockFetch).toHaveBeenCalledTimes(1)
  }
)
