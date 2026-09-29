/** @jest-environment node */
import { cmsQuery } from "@lib/cms/graphql"
import { blogPostsQuery } from "@lib/cms/operations"
import type { BlogPostsQueryVariables } from "@lib/cms/generated/graphql"

const variables: BlogPostsQueryVariables = {
  page: 1,
  limit: 10,
  sort: "-publishedAt",
  includeContent: false,
}

const mockFetch = jest.fn()
const ok = (body: unknown) => ({
  ok: true,
  status: 200,
  json: async () => body,
})

beforeEach(() => {
  mockFetch.mockReset()
  global.fetch = mockFetch
  process.env.CMS_API_KEY = "service-key"
  process.env.CMS_API_URL = "https://cms.example"
})
afterEach(() => jest.restoreAllMocks())

it("requires the server credential before fetching public content", async () => {
  delete process.env.CMS_API_KEY
  await expect(cmsQuery(blogPostsQuery, variables)).rejects.toThrow(
    "CMS_API_KEY is required"
  )
  expect(mockFetch).not.toHaveBeenCalled()
})

it("does not accept partial data with GraphQL errors or expose upstream messages", async () => {
  mockFetch.mockResolvedValue(
    ok({
      data: { result: { docs: [{ id: 1 }] } },
      errors: [
        { message: "secret upstream body", extensions: { statusCode: 403 } },
      ],
    })
  )
  await expect(cmsQuery(blogPostsQuery, variables)).rejects.toMatchObject({
    status: 403,
    message: "Railway CMS GraphQL BlogPosts failed (403)",
  })
  expect(mockFetch).toHaveBeenCalledTimes(1)
})

it.each([null, [], { errors: {} }, { data: {} }, { data: { result: null } }])(
  "rejects malformed GraphQL envelopes",
  async (body) => {
    mockFetch.mockResolvedValue(ok(body))
    await expect(
      cmsQuery(blogPostsQuery, variables, { retries: false })
    ).rejects.toMatchObject({ status: 502 })
  }
)

it("rejects malformed JSON", async () => {
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError()
    },
  })
  await expect(
    cmsQuery(blogPostsQuery, variables, { retries: false })
  ).rejects.toMatchObject({ status: 502 })
})

it.each(["http", "graphql", "network"])(
  "retries transient %s read failures",
  async (failure) => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined)
    jest.spyOn(global, "setTimeout").mockImplementation((callback) => {
      callback()
      return null as any
    })
    if (failure === "http")
      mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })
    if (failure === "graphql")
      mockFetch.mockResolvedValueOnce(
        ok({
          errors: [
            { message: "secret error", extensions: { statusCode: 503 } },
          ],
        })
      )
    if (failure === "network")
      mockFetch.mockRejectedValueOnce(new TypeError("secret network error"))
    mockFetch.mockResolvedValueOnce(ok({ data: { result: { docs: [] } } }))
    expect(
      await cmsQuery(blogPostsQuery, {
        ...variables,
        where: { slug: { equals: "secret-token" } },
      })
    ).toEqual({
      docs: [],
    })
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(warn).toHaveBeenCalledWith(
      "Railway CMS GraphQL BlogPosts unavailable; retrying in 500ms"
    )
  }
)

it("bounds retries and fails rather than returning an empty list", async () => {
  jest.spyOn(console, "warn").mockImplementation(() => undefined)
  jest.spyOn(global, "setTimeout").mockImplementation((callback) => {
    callback()
    return null as any
  })
  mockFetch.mockResolvedValue({ ok: false, status: 429 })
  await expect(cmsQuery(blogPostsQuery, variables)).rejects.toMatchObject({
    status: 429,
  })
  expect(mockFetch).toHaveBeenCalledTimes(3)
})

it("does not retry permanent HTTP errors or read their response body", async () => {
  const text = jest.fn()
  mockFetch.mockResolvedValue({ ok: false, status: 401, text })
  await expect(cmsQuery(blogPostsQuery, variables)).rejects.toMatchObject({
    status: 401,
  })
  expect(mockFetch).toHaveBeenCalledTimes(1)
  expect(text).not.toHaveBeenCalled()
})
