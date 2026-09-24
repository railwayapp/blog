import { mapCMSPreviewPost } from "@lib/cms"
import { cmsTraceHeaders, traceCMS } from "@lib/tracing"
import { postPreviewPath, previewToken } from "./preview"

/** The CMS checks the signature and persisted grant on every read. */
export async function getPreviewPost(slug: unknown, token: unknown) {
  const path = postPreviewPath(slug)
  const validatedToken = previewToken(token)
  if (!path || !validatedToken) return null

  return traceCMS("cms.preview", {}, async (span) => {
    const url = new URL(
      "/api/content-preview",
      process.env.CMS_API_URL || "https://cms.railway.com"
    )
    url.searchParams.set("collection", "posts")
    url.searchParams.set("path", path)
    url.searchParams.set("token", validatedToken)

    // This document-scoped token is the credential; never attach the service key.
    const response = await fetch(url, {
      headers: cmsTraceHeaders(),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    })
    span.setAttribute("http.response.status_code", response.status)
    if ([400, 401, 403, 404, 410].includes(response.status)) return null
    if (!response.ok) throw new Error("CMS preview temporarily unavailable")

    const result = await response.json()
    if (
      !result ||
      result.collection !== "posts" ||
      result.path !== path ||
      result.preview !== true ||
      !result.document ||
      typeof result.document !== "object" ||
      Array.isArray(result.document) ||
      result.document.slug !== slug
    )
      throw new Error("Invalid CMS preview response")

    return mapCMSPreviewPost(result.document)
  })
}
