import { BlogAuthor, BlogCategory, BlogMedia, BlogPost } from "@lib/types"
import { traceCMS } from "@lib/tracing"
import { cmsQuery } from "./graphql"
import { blogCategoriesQuery, blogPostsQuery } from "./operations"
import type {
  BlogAuthorFieldsFragment,
  BlogCategoryFieldsFragment,
  BlogMediaFieldsFragment,
  BlogPostsQuery,
  BlogPostsQueryVariables,
  BlogPreviewQuery,
} from "./generated/graphql"

const DEFAULT_LIMIT = 100
// Keep populated post queries within the CMS's GraphQL request budget.
// This is a page size; listAllCollection still reads every page.
const MAX_POSTS_PER_PAGE = 10

// Mapping remains tolerant of incomplete drafts and malformed upstream fields.
// Field names and value types come from the generated operation selections.
type DeepPartial<T> = T extends Array<infer Item>
  ? Array<DeepPartial<Item>>
  : T extends object
  ? { [Key in keyof T]?: DeepPartial<T[Key]> }
  : T
type CMSMedia = DeepPartial<BlogMediaFieldsFragment>
type CMSAuthor = DeepPartial<BlogAuthorFieldsFragment>
type CMSCategory = DeepPartial<BlogCategoryFieldsFragment>
type CMSPost = DeepPartial<
  NonNullable<BlogPostsQuery["result"]>["docs"][number]
>
type CMSPostPreview = DeepPartial<
  Extract<
    NonNullable<NonNullable<BlogPreviewQuery["result"]>["document"]>,
    { __typename: "CMSPostPreview" }
  >
> &
  Pick<CMSPost, "archivedAt">

type ListOptions = {
  includeContent?: boolean
  limit?: number
  sort?: string
  where?: BlogPostsQueryVariables["where"]
}

type CMSPage<T> = {
  docs: T[]
  hasNextPage: boolean
  nextPage: number | null
}

const mergeWhere = (
  ...clauses: Array<BlogPostsQueryVariables["where"]>
): BlogPostsQueryVariables["where"] => {
  const filtered = clauses.filter(
    (clause): clause is NonNullable<BlogPostsQueryVariables["where"]> =>
      clause != null
  )

  if (filtered.length === 0) return undefined
  if (filtered.length === 1) return filtered[0]

  return { AND: filtered }
}

const publishedWhere: BlogPostsQueryVariables["where"] = {
  _status: {
    equals: "published",
  },
  // Defense in depth: the readonly API key already hides archived posts at
  // the CMS access layer, but a staff-level key would not.
  archivedAt: {
    exists: false,
  },
}

const visibleCategoryWhere = {
  visible: {
    equals: true,
  },
}

const listAllCollection = async <T>(
  collection: "posts" | "categories",
  readPage: (page: number) => Promise<CMSPage<T>>
) =>
  traceCMS("cms.list", { "cms.collection": collection }, async (span) => {
    const docs: T[] = []
    let page = 1
    let hasNextPage = false

    do {
      const response = await readPage(page)
      if (
        !Array.isArray(response.docs) ||
        typeof response.hasNextPage !== "boolean" ||
        (response.hasNextPage &&
          response.nextPage != null &&
          (!Number.isInteger(response.nextPage) || response.nextPage <= page))
      )
        throw new Error("Invalid CMS pagination response")

      docs.push(...response.docs)
      hasNextPage = Boolean(response.hasNextPage)
      page = response.nextPage ?? page + 1
    } while (hasNextPage)

    span.setAttribute("cms.document_count", docs.length)
    return docs
  })

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object")

// The CMS returns optional SEO fields as empty strings ("") when left blank,
// not null. An empty string is truthy enough to defeat `?? fallback` (nullish
// coalescing only falls back on null/undefined), which let blank seoTitle /
// seoDescription override the post title/description and surface the generic
// site defaults on every social card. Normalize blank/whitespace to null.
const nonEmptyString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() !== "" ? value : null

export const mapCMSMedia = (media: number | CMSMedia | null | undefined) => {
  if (!isRecord(media) || typeof media.url !== "string" || !media.url) {
    return null
  }

  const alt = typeof media.alt === "string" ? media.alt : ""

  return {
    alt,
    height: typeof media.height === "number" ? media.height : null,
    id: String(media.id),
    mimeType: typeof media.mimeType === "string" ? media.mimeType : null,
    url: media.url,
    width: typeof media.width === "number" ? media.width : null,
  } satisfies BlogMedia
}

const getGithubAvatarURL = (githubUrl?: string | null) => {
  const handle = githubUrl?.match(/github\.com\/([^/?#]+)/i)?.[1]
  return handle ? `https://github.com/${handle}.png` : null
}

export const mapCMSAuthor = (author: number | CMSAuthor): BlogAuthor | null => {
  if (!isRecord(author) || typeof author.name !== "string" || !author.name) {
    return null
  }

  const avatar = mapCMSMedia(author.avatar)
  const githubUrl =
    typeof author.githubUrl === "string" ? author.githubUrl : null

  return {
    avatar,
    avatarUrl: avatar?.url ?? getGithubAvatarURL(githubUrl),
    githubUrl,
    id: String(author.id),
    name: author.name,
    slug: typeof author.slug === "string" ? author.slug : null,
    title: typeof author.title === "string" ? author.title : null,
  }
}

export const mapCMSCategory = (
  category: number | CMSCategory | null | undefined
): BlogCategory | null => {
  if (
    !isRecord(category) ||
    typeof category.title !== "string" ||
    typeof category.slug !== "string"
  ) {
    return null
  }

  return {
    description:
      typeof category.description === "string" ? category.description : null,
    id: String(category.id),
    order: typeof category.order === "number" ? category.order : null,
    seoDescription: nonEmptyString(category.seoDescription),
    seoTitle: nonEmptyString(category.seoTitle),
    showInNavigation:
      typeof category.showInNavigation === "boolean"
        ? category.showInNavigation
        : null,
    slug: category.slug,
    title: category.title,
    visible: typeof category.visible === "boolean" ? category.visible : null,
  }
}

const mapPost = (post: CMSPost, preview: boolean): BlogPost | null => {
  if (
    !post ||
    (!preview && post._status !== "published") ||
    post.archivedAt != null ||
    typeof post.slug !== "string" ||
    (!preview &&
      (typeof post.title !== "string" ||
        typeof post.description !== "string" ||
        typeof post.publishedAt !== "string"))
  ) {
    return null
  }

  const authors = (post.authors ?? [])
    .map(mapCMSAuthor)
    .filter((author): author is BlogAuthor => author != null)

  return {
    authors,
    category: mapCMSCategory(post.category),
    content: typeof post.content === "string" ? post.content : null,
    createdAt: post.createdAt ?? post.publishedAt ?? "",
    description: post.description ?? "",
    externalAuthor: Boolean(post.externalAuthor),
    featured: Boolean(post.featured),
    featuredImage: mapCMSMedia(post.featuredImage),
    id: String(post.id),
    publishedAt: post.publishedAt ?? "",
    seoDescription: nonEmptyString(post.seoDescription),
    seoTitle: nonEmptyString(post.seoTitle),
    slug: post.slug,
    socialImage: mapCMSMedia(post.socialImage),
    title: preview ? post.title || "Untitled post" : post.title,
    updatedAt: post.updatedAt ?? post.publishedAt ?? "",
  }
}

export const mapCMSPost = (post: CMSPost) => mapPost(post, false)

// Only use with the projection returned by the authorized cmsContentPreview query.
export const mapCMSPreviewPost = (post: CMSPostPreview) => mapPost(post, true)

export const getBlogLink = (slug: string) => `/p/${slug}`

export const getCategoryRouteSlug = (slug: string) =>
  slug === "guides" ? "guide" : slug

export const getCategoryPath = (category: BlogCategory | string) => {
  const slug = typeof category === "string" ? category : category.slug
  return `/${slug === "guide" ? "guides" : slug}`
}

export const getCategoryLabel = (category: BlogCategory | string) => {
  const title = typeof category === "string" ? category : category.title
  return title === "Guide" ? "Guides" : title
}

export const getPosts = async ({
  includeContent = false,
  limit = DEFAULT_LIMIT,
  sort = "-publishedAt",
  where,
}: ListOptions = {}) => {
  const docs = await listAllCollection("posts", (page) =>
    cmsQuery(blogPostsQuery, {
      page,
      limit: Math.min(limit, MAX_POSTS_PER_PAGE),
      includeContent,
      sort,
      where: mergeWhere(publishedWhere, where),
    })
  )

  return docs.map(mapCMSPost).filter((post): post is BlogPost => post != null)
}

export const getPostBySlug = async (slug: string) => {
  const posts = await getPosts({
    includeContent: true,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return posts[0] ?? null
}

export const getCategories = async () => {
  const docs = await listAllCollection("categories", (page) =>
    cmsQuery(blogCategoriesQuery, {
      page,
      limit: DEFAULT_LIMIT,
      where: visibleCategoryWhere,
    })
  )

  return docs
    .map(mapCMSCategory)
    .filter((category): category is BlogCategory => category != null)
}

export const getPostsByCategorySlug = async (slug: string) => {
  // GraphQL relationship filters accept IDs, rather than dotted slug paths.
  const categories = await listAllCollection("categories", (page) =>
    cmsQuery(blogCategoriesQuery, {
      page,
      limit: 1,
      where: { slug: { equals: getCategoryRouteSlug(slug) } },
    })
  )
  const category = categories[0]
  if (!category) return []

  return getPosts({ where: { category: { equals: category.id } } })
}

export const getRelatedPosts = async (post: BlogPost, limit = 2) => {
  if (!post.category) return []

  const posts = await getPosts({
    where: { category: { equals: post.category.id } },
  })

  return posts.filter((item) => item.slug !== post.slug).slice(0, limit)
}
