import { getServerSideProps } from "../../pages/preview/p/[slug]"
import { getPreviewPost } from "@lib/cms/preview.server"
import { previewHeaders } from "@lib/cms/preview"
jest.mock("@lib/cms/preview.server", () => ({ getPreviewPost: jest.fn() }))
jest.mock("@layouts/PostPage", () => ({ PostPage: () => null }))
jest.mock("@layouts/Page", () => ({ __esModule: true, default: () => null }))

it.each(["ok", "missing", "failure"])(
  "keeps preview %s responses private and correctly status-coded",
  async (outcome) => {
    const post = { id: "9", title: "Draft", slug: "new-post" }
    const mock = getPreviewPost as jest.Mock
    if (outcome === "failure")
      mock.mockRejectedValue(new Error("upstream token must not be logged"))
    else mock.mockResolvedValue(outcome === "ok" ? post : null)
    const res = { setHeader: jest.fn(), statusCode: 200 }
    const result = await getServerSideProps({
      params: { slug: "new-post" },
      query: { cmsPreview: "token" },
      res,
    } as any)
    expect(res.statusCode).toBe(
      outcome === "ok" ? 200 : outcome === "missing" ? 404 : 503
    )
    for (const [key, value] of Object.entries(previewHeaders))
      expect(res.setHeader).toHaveBeenCalledWith(key, value)
    expect(result).not.toHaveProperty("revalidate")
    expect(JSON.stringify(result)).not.toContain("token")
  }
)
