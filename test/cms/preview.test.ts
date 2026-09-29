/** @jest-environment node */
import { getPreviewPost } from "@lib/cms/preview.server"
import { mapCMSPost, mapCMSPreviewPost, getPosts } from "@lib/cms"

const draft = {
  id: 9,
  slug: "new-post",
  title: "Draft title",
  _status: "draft" as const,
}
const mockFetch = jest.fn()
beforeEach(() => {
  mockFetch.mockReset()
  global.fetch = mockFetch
  process.env.CMS_API_URL = "https://cms.example"
})
const response = (
  status: number,
  document: unknown = draft,
  envelope = {}
) => ({
  ok: status === 200,
  status,
  json: async () => ({
    data: {
      result: {
        collection: "posts",
        path: "/p/new-post",
        preview: true,
        document: document && {
          __typename: "CMSPostPreview",
          ...(document as object),
        },
        ...envelope,
      },
    },
  }),
})

it.each([undefined, "", ["token", "other"], "x".repeat(1025)])(
  "rejects invalid token %j without reading CMS",
  async (token) => {
    expect(await getPreviewPost("new-post", token)).toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  }
)
it.each(["../private", "a/b", "a?b", "", undefined])(
  "rejects invalid slug %j",
  async (slug) => {
    expect(await getPreviewPost(slug, "token")).toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  }
)
it("reads only the authorized projection without a service key and without caching", async () => {
  mockFetch.mockResolvedValue(response(200))
  expect(await getPreviewPost("new-post", "token")).toMatchObject({
    title: "Draft title",
    description: "",
    publishedAt: "",
    authors: [],
  })
  const [url, options] = mockFetch.mock.calls[0]
  expect(url.origin).toBe("https://cms.example")
  expect(url.pathname).toBe("/api/graphql")
  expect(url.search).toBe("")
  expect(JSON.parse(options.body)).toMatchObject({
    operationName: "BlogPreview",
    variables: { path: "/p/new-post", token: "token" },
  })
  expect(options).toMatchObject({
    method: "POST",
    cache: "no-store",
    redirect: "error",
  })
  // Trace context may be sent, but preview reads must never use the service key.
  expect(
    Object.keys(options.headers ?? {}).map((key) => key.toLowerCase())
  ).not.toContain("authorization")
})
it.each([400, 401, 403, 404, 410])(
  "does not fall back to published content on CMS %s",
  async (status) => {
    mockFetch.mockResolvedValue(response(status))
    expect(await getPreviewPost("new-post", "token")).toBeNull()
    expect(mockFetch).toHaveBeenCalledTimes(1)
  }
)
it("keeps temporary failures distinct from unavailable links", async () => {
  mockFetch.mockResolvedValue(response(503))
  await expect(getPreviewPost("new-post", "token")).rejects.toThrow(
    "temporarily unavailable"
  )
})
it.each([400, 401, 403, 404, 410])(
  "honors preview denial with HTTP 200 and GraphQL status %s",
  async (statusCode) => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        errors: [{ message: "Denied", extensions: { statusCode } }],
        data: { result: null },
      }),
    })
    expect(await getPreviewPost("new-post", "token")).toBeNull()
    expect(mockFetch).toHaveBeenCalledTimes(1)
  }
)
it.each([
  {
    errors: [
      { message: "Upstream unavailable", extensions: { statusCode: 503 } },
    ],
  },
  { errors: [{ message: "Unknown failure" }], data: { result: null } },
  { errors: "malformed" },
  { data: { result: null } },
  {
    errors: [
      { message: "Denied", extensions: { statusCode: 404 } },
      { message: "Unavailable", extensions: { statusCode: 500 } },
    ],
  },
])("treats an incomplete GraphQL preview as unavailable", async (body) => {
  mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => body })
  await expect(getPreviewPost("new-post", "token")).rejects.toThrow(
    "temporarily unavailable"
  )
  expect(mockFetch).toHaveBeenCalledTimes(1)
})
it.each([
  { collection: "job-postings" },
  { path: "/p/other" },
  { preview: false },
  { document: null },
  { document: [] },
  { document: { ...draft, __typename: "CMSJobPreview" } },
  { document: { ...draft, slug: "other" } },
])("rejects a mismatched CMS response %j", async (envelope) => {
  mockFetch.mockResolvedValue(response(200, draft, envelope))
  await expect(getPreviewPost("new-post", "token")).rejects.toThrow(
    "Invalid CMS preview response"
  )
})
it("keeps normal post mapping published-only and allows incomplete previews", () => {
  const complete = {
    ...draft,
    description: "Description",
    publishedAt: "2026-09-11",
  }
  expect(mapCMSPost(complete)).toBeNull()
  expect(mapCMSPreviewPost(draft)).toMatchObject({
    title: "Draft title",
    publishedAt: "",
  })
  expect(mapCMSPreviewPost({ ...draft, title: null })).toMatchObject({
    title: "Untitled post",
  })
  expect(mapCMSPreviewPost({ ...draft, archivedAt: "2026-09-11" })).toBeNull()
})
it("all public post consumers still filter drafts and archives", async () => {
  process.env.CMS_API_KEY = "test-published-key"
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ data: { result: { docs: [], hasNextPage: false } } }),
  })
  await getPosts()
  const body = JSON.parse(mockFetch.mock.calls[0][1].body)
  expect(body.variables.where).toEqual({
    _status: { equals: "published" },
    archivedAt: { exists: false },
  })
  expect(body.query).toContain("draft: false")
})
