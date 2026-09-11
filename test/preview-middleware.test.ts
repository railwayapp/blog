/** @jest-environment node */
import { middleware } from "../middleware"
import { previewHeaders } from "@lib/cms/preview"
jest.mock("next/server", () => ({
  NextResponse: Object.assign(
    class {
      constructor(public body: string, public init: unknown) {}
    },
    {
      next: () => ({ next: true }),
      rewrite: (url: URL, init: unknown) => ({ url, init }),
    }
  ),
}))
const request = (path: string) => {
  const url = new URL(path, "https://blog.railway.com")
  return { nextUrl: Object.assign(url, { clone: () => new URL(url) }) } as any
}
it("preserves the published route without a preview query", () => {
  expect(middleware(request("/p/post"))).toEqual({ next: true })
})
it.each(["token", "", "one&cmsPreview=two"])(
  "routes token %s away from ISR",
  (value) => {
    const response = middleware(request(`/p/post?cmsPreview=${value}`)) as any
    expect(response.url.pathname).toBe("/preview/p/post")
    expect(response.url.searchParams.has("cmsPreview")).toBe(true)
    expect(response.init.headers).toEqual(previewHeaders)
  }
)
it.each(["/p/post.md", "/p/post/markdown"])(
  "rejects preview Markdown exports %s",
  (path) => {
    const response = middleware(request(`${path}?cmsPreview=token`)) as any
    expect(response.init).toEqual({ status: 404, headers: previewHeaders })
  }
)
