// Compile-only checks. This function is never called or included in the app.
import { cmsQuery } from "@lib/cms/graphql"
import { blogPostsQuery, blogPreviewQuery } from "@lib/cms/operations"
import type {
  BlogPostsQuery,
  BlogPostsQueryVariables,
} from "@lib/cms/generated/graphql"

export function verifyGeneratedCMSContracts() {
  const variables: BlogPostsQueryVariables = {
    page: 1,
    limit: 10,
    sort: "-publishedAt",
    includeContent: false,
    where: { AND: [{ _status: { equals: "published" } }] },
  }
  const result: Promise<NonNullable<BlogPostsQuery["result"]>> = cmsQuery(
    blogPostsQuery,
    variables
  )

  // @ts-expect-error GraphQL Int inputs require numbers.
  cmsQuery(blogPostsQuery, { ...variables, page: "1" })
  // @ts-expect-error Required variables cannot be omitted.
  cmsQuery(blogPostsQuery, { page: 1 })
  // @ts-expect-error GraphQL filter conjunctions use uppercase AND.
  cmsQuery(blogPostsQuery, { ...variables, where: { and: [] } })
  cmsQuery(blogPostsQuery, {
    ...variables,
    // @ts-expect-error Dotted REST relationship filters are unavailable.
    where: { "category.slug": { equals: "guide" } },
  })
  // @ts-expect-error Preview reads require a token.
  cmsQuery(blogPreviewQuery, { path: "/p/post" })
  result.then((page) => {
    // @ts-expect-error Only selected response fields are available.
    return page.docs[0].notASelectedField
  })
  return result
}
