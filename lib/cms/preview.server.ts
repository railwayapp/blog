import { mapCMSPreviewPost } from "@lib/cms"
import { traceCMS } from "@lib/tracing"
import { cmsQuery, CMSGraphQLReadError } from "./graphql"
import { blogPreviewQuery } from "./operations"
import type { BlogPreviewQuery } from "./generated/graphql"
import { postPreviewPath, previewToken } from "./preview"

/** The CMS checks the signature and persisted grant on every read. */
export async function getPreviewPost(slug: unknown, token: unknown) {
  const path = postPreviewPath(slug)
  const validatedToken = previewToken(token)
  if (!path || !validatedToken) return null

  return traceCMS("cms.preview", {}, async () => {
    let result: NonNullable<BlogPreviewQuery["result"]>
    try {
      result = await cmsQuery(
        blogPreviewQuery,
        { path, token: validatedToken },
        { authenticate: false, retries: false, timeout: 8000 }
      )
    } catch (error) {
      if (
        error instanceof CMSGraphQLReadError &&
        [400, 401, 403, 404, 410].includes(error.status)
      )
        return null
      throw new Error("CMS preview temporarily unavailable")
    }
    if (
      !result ||
      result.collection !== "posts" ||
      result.path !== path ||
      result.preview !== true ||
      !result.document ||
      typeof result.document !== "object" ||
      Array.isArray(result.document) ||
      result.document.__typename !== "CMSPostPreview" ||
      result.document.slug !== slug
    )
      throw new Error("Invalid CMS preview response")

    return mapCMSPreviewPost(result.document)
  })
}
