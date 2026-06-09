export interface BlogMedia {
  alt: string
  height?: number | null
  id: string
  mimeType?: string | null
  url: string
  width?: number | null
}

export interface BlogAuthor {
  avatar: BlogMedia | null
  avatarUrl: string | null
  githubUrl?: string | null
  id: string
  name: string
  slug?: string | null
  title?: string | null
}

export interface BlogCategory {
  description?: string | null
  id: string
  order?: number | null
  seoDescription?: string | null
  seoTitle?: string | null
  slug: string
  title: string
  visible?: boolean | null
}

export interface BlogPost {
  authors: BlogAuthor[]
  category: BlogCategory | null
  content: string | null
  createdAt: string
  description: string
  externalAuthor: boolean
  featured: boolean
  featuredImage: BlogMedia | null
  id: string
  publishedAt: string
  seoDescription?: string | null
  seoTitle?: string | null
  slug: string
  socialImage: BlogMedia | null
  title: string
  updatedAt: string
}

export interface PaginatedCMSResponse<T> {
  docs: T[]
  hasNextPage?: boolean
  hasPrevPage?: boolean
  limit?: number
  nextPage?: number | null
  page?: number
  pagingCounter?: number
  prevPage?: number | null
  totalDocs?: number
  totalPages?: number
}
