import {
  BlogAuthor,
  BlogCategory,
  BlogMedia,
  BlogPost,
  PaginatedCMSResponse,
} from "@lib/types"

const DEFAULT_CMS_API_URL = "https://cms.railway.com"
const DEFAULT_LIMIT = 100

interface PayloadMedia {
  alt?: string | null
  filename?: string | null
  height?: number | null
  id: number | string
  mimeType?: string | null
  url?: string | null
  width?: number | null
}

interface PayloadAuthor {
  avatar?: number | PayloadMedia | null
  githubUrl?: string | null
  id: number | string
  name?: string | null
  slug?: string | null
  title?: string | null
}

interface PayloadCategory {
  description?: string | null
  id: number | string
  order?: number | null
  seoDescription?: string | null
  seoTitle?: string | null
  slug?: string | null
  title?: string | null
  visible?: boolean | null
}

interface PayloadPost {
  _status?: "draft" | "published" | null
  authors?: Array<number | PayloadAuthor> | null
  category?: number | PayloadCategory | null
  content?: string | null
  createdAt?: string
  description?: string | null
  externalAuthor?: boolean | null
  featured?: boolean | null
  featuredImage?: number | PayloadMedia | null
  id: number | string
  publishedAt?: string | null
  seoDescription?: string | null
  seoTitle?: string | null
  slug?: string | null
  socialImage?: number | PayloadMedia | null
  title?: string | null
  updatedAt?: string
}

type ListOptions = {
  includeContent?: boolean
  limit?: number
  sort?: string
  where?: Record<string, unknown>
}

type ListCollectionOptions = {
  depth?: number
  limit?: number
  page?: number
  selectContent?: boolean
  sort?: string
  where?: Record<string, unknown>
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "")

const getCMSBaseURL = () =>
  trimTrailingSlash(process.env.CMS_API_URL || DEFAULT_CMS_API_URL)

const getCMSAPIKey = () => {
  const key = process.env.CMS_API_KEY

  if (!key) {
    throw new Error("CMS_API_KEY is required to fetch Railway CMS content")
  }

  return key
}

const appendWhere = (
  params: URLSearchParams,
  where: Record<string, unknown>,
  prefix = "where"
) => {
  for (const [key, value] of Object.entries(where)) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item && typeof item === "object") {
          appendWhere(
            params,
            item as Record<string, unknown>,
            `${prefix}[${key}][${index}]`
          )
        } else if (item !== undefined && item !== null) {
          params.set(`${prefix}[${key}][${index}]`, String(item))
        }
      })
      continue
    }

    if (value && typeof value === "object") {
      appendWhere(params, value as Record<string, unknown>, `${prefix}[${key}]`)
      continue
    }

    if (value !== undefined && value !== null && value !== "") {
      params.set(`${prefix}[${key}]`, String(value))
    }
  }
}

const mergeWhere = (
  ...clauses: Array<Record<string, unknown> | undefined>
): Record<string, unknown> | undefined => {
  const filtered = clauses.filter(Boolean) as Record<string, unknown>[]

  if (filtered.length === 0) return undefined
  if (filtered.length === 1) return filtered[0]

  return { and: filtered }
}

const publishedWhere = {
  _status: {
    equals: "published",
  },
}

const visibleCategoryWhere = {
  visible: {
    equals: true,
  },
}

const cmsRequest = async <T>(path: string, params: URLSearchParams) => {
  const url = `${getCMSBaseURL()}${path}?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getCMSAPIKey()}`,
    },
  })

  if (!response.ok) {
    const message = await response.text().catch(() => "")
    throw new Error(
      `Railway CMS request failed (${response.status}) for ${path}${
        message ? `: ${message}` : ""
      }`
    )
  }

  return (await response.json()) as T
}

const listCollection = async <T>(
  collection: string,
  {
    depth = 2,
    limit = DEFAULT_LIMIT,
    page = 1,
    selectContent = true,
    sort,
    where,
  }: ListCollectionOptions
) => {
  const params = new URLSearchParams()
  params.set("depth", String(depth))
  params.set("limit", String(limit))
  params.set("page", String(page))

  if (sort) {
    params.set("sort", sort)
  }

  if (!selectContent) {
    params.set("select[content]", "false")
  }

  if (where) {
    appendWhere(params, where)
  }

  return cmsRequest<PaginatedCMSResponse<T>>(`/api/${collection}`, params)
}

const listAllCollection = async <T>(
  collection: string,
  options: Omit<ListCollectionOptions, "page"> = {}
) => {
  const docs: T[] = []
  let page = 1
  let hasNextPage = false

  do {
    const response = await listCollection<T>(collection, {
      ...options,
      page,
    })

    docs.push(...(response.docs ?? []))
    hasNextPage = Boolean(response.hasNextPage)
    page = response.nextPage ?? page + 1
  } while (hasNextPage)

  return docs
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object")

export const mapCMSMedia = (media: number | PayloadMedia | null | undefined) => {
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

export const mapCMSAuthor = (
  author: number | PayloadAuthor
): BlogAuthor | null => {
  if (!isRecord(author) || typeof author.name !== "string" || !author.name) {
    return null
  }

  const avatar = mapCMSMedia(author.avatar as number | PayloadMedia | null)
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
  category: number | PayloadCategory | null | undefined
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
    seoDescription:
      typeof category.seoDescription === "string"
        ? category.seoDescription
        : null,
    seoTitle:
      typeof category.seoTitle === "string" ? category.seoTitle : null,
    slug: category.slug,
    title: category.title,
    visible:
      typeof category.visible === "boolean" ? category.visible : null,
  }
}

export const mapCMSPost = (post: PayloadPost): BlogPost | null => {
  if (
    !post ||
    (post._status != null && post._status !== "published") ||
    typeof post.title !== "string" ||
    typeof post.slug !== "string" ||
    typeof post.description !== "string" ||
    typeof post.publishedAt !== "string"
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
    createdAt: post.createdAt ?? post.publishedAt,
    description: post.description,
    externalAuthor: Boolean(post.externalAuthor),
    featured: Boolean(post.featured),
    featuredImage: mapCMSMedia(post.featuredImage),
    id: String(post.id),
    publishedAt: post.publishedAt,
    seoDescription:
      typeof post.seoDescription === "string" ? post.seoDescription : null,
    seoTitle: typeof post.seoTitle === "string" ? post.seoTitle : null,
    slug: post.slug,
    socialImage: mapCMSMedia(post.socialImage),
    title: post.title,
    updatedAt: post.updatedAt ?? post.publishedAt,
  }
}

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
  const docs = await listAllCollection<PayloadPost>("posts", {
    depth: 2,
    limit,
    selectContent: includeContent,
    sort,
    where: mergeWhere(publishedWhere, where),
  })

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
  const docs = await listAllCollection<PayloadCategory>("categories", {
    depth: 0,
    limit: DEFAULT_LIMIT,
    sort: "order",
    where: visibleCategoryWhere,
  })

  return docs
    .map(mapCMSCategory)
    .filter((category): category is BlogCategory => category != null)
}

export const getPostsByCategorySlug = async (slug: string) =>
  getPosts({
    where: {
      "category.slug": {
        equals: getCategoryRouteSlug(slug),
      },
    },
  })

export const getRelatedPosts = async (post: BlogPost, limit = 2) => {
  if (!post.category) return []

  const posts = await getPostsByCategorySlug(post.category.slug)

  return posts.filter((item) => item.slug !== post.slug).slice(0, limit)
}
