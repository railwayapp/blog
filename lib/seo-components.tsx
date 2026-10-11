import { getAuthorPath, getBlogLink, getCategoryPath } from "@lib/cms"
import { buildCMSImageURL } from "@lib/cms/image"
import {
  extractFAQs,
  extractTableOfContents,
  FAQItem,
  TableOfContentsItem,
} from "@lib/markdown"
import { BlogAuthor, BlogCategory, BlogPost } from "@lib/types"
import React from "react"

export { extractFAQs, extractTableOfContents }
export type { FAQItem, TableOfContentsItem }

const BASE_URL = "https://blog.railway.com"
const META_DESCRIPTION_MAX = 160

/** Site-wide description for the blog homepage and default meta tags. */
export const BLOG_DESCRIPTION =
  "Guides, engineering deep dives, and product news from the team building " +
  "Railway: deploying apps, databases, and AI agents to the cloud."

/**
 * Fallback descriptions for hub pages whose CMS category has no description.
 * The CMS value always wins; these only replace the generic site default so
 * each hub page describes what is actually on it.
 */
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  news: "Railway product announcements, launches, and company news.",
  guide:
    "Practical guides to deploying, scaling, and comparing cloud platforms, " +
    "databases, and developer tools, from the Railway team.",
  company: "How Railway works as a company: culture, remote work, and hiring.",
  engineering:
    "Deep dives into how Railway builds its cloud: networking, storage, " +
    "orchestration, and the infrastructure behind the platform.",
  ai: "Building, deploying, and running AI apps and agents on Railway.",
  "scaling-railway":
    "The Scaling Railway series: how Railway grew its platform, team, and " +
    "support to serve hundreds of thousands of developers.",
  "user-stories":
    "How teams and companies build and run their products on Railway.",
}

export const getCategoryDescription = (
  category: BlogCategory
): string | undefined =>
  category.seoDescription ??
  category.description ??
  CATEGORY_DESCRIPTIONS[category.slug] ??
  undefined

const authorUrl = (author: BlogAuthor) =>
  author.slug ? `${BASE_URL}${getAuthorPath(author.slug)}` : undefined

/** schema.org Person for an author, linked to their author page. */
export const generatePersonSchema = (author: BlogAuthor): object => ({
  "@type": "Person",
  name: author.name,
  url: authorUrl(author),
  jobTitle: author.title || undefined,
  image: author.avatarUrl || undefined,
  sameAs: author.githubUrl ? [author.githubUrl] : undefined,
  worksFor: { "@type": "Organization", name: "Railway", url: "https://railway.com" },
})

/**
 * CollectionPage + ItemList for hub pages (home, categories, authors) so
 * crawlers see the page as an index of posts rather than an empty shell.
 */
export const generateCollectionPageSchema = ({
  name,
  description,
  url,
  posts,
  about,
}: {
  name: string
  description?: string
  url: string
  posts: BlogPost[]
  about?: object
}): object => ({
  "@context": "https://schema.org",
  "@type": about ? "ProfilePage" : "CollectionPage",
  name,
  description,
  url,
  ...(about && { mainEntity: about }),
  isPartOf: { "@type": "WebSite", name: "Railway Blog", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Railway", url: "https://railway.com" },
  hasPart: {
    "@type": "ItemList",
    numberOfItems: posts.length,
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${BASE_URL}${getBlogLink(post.slug)}`,
      name: post.title,
    })),
  },
})

/** Two-level breadcrumb (Home → hub page) for category and author pages. */
export const generateHubBreadcrumbSchema = (name: string, url: string): object => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    { "@type": "ListItem", position: 2, name, item: url },
  ],
})
const BRAND_SUFFIX = " | Railway Blog"

/**
 * Produces a meta description that is at most 160 characters, truncated at the
 * nearest word boundary with an ellipsis when necessary. Strips leading/trailing
 * whitespace and normalizes internal runs.
 */
export const buildMetaDescription = (
  description: string | null | undefined
): string | undefined => {
  const text = (description ?? "").replace(/\s+/g, " ").trim()
  if (!text) return undefined
  if (text.length <= META_DESCRIPTION_MAX) return text

  // Leave room for the trailing "…" (single char).
  const truncated = text.slice(0, META_DESCRIPTION_MAX - 1)
  const lastSpace = truncated.lastIndexOf(" ")
  const clean = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated

  return `${clean}…`
}

/**
 * Appends " | Railway Blog" to a title unless the title already contains
 * "Railway" (case-insensitive), to avoid doubling up on CMS-authored titles
 * that already include branding.
 */
export const buildSeoTitle = (
  title: string | null | undefined
): string | undefined => {
  const text = (title ?? "").trim()
  if (!text) return undefined
  if (/railway/i.test(text)) return text
  return `${text}${BRAND_SUFFIX}`
}

export const generateBlogPostSchema = (post: BlogPost, url: string): object => {
  const image = post.socialImage?.url ?? post.featuredImage?.url
  const authorSchema =
    post.authors.length === 1
      ? generatePersonSchema(post.authors[0])
      : post.authors.length > 1
        ? post.authors.map(generatePersonSchema)
        : undefined

  // Route schema image through the CMS gateway so crawlers get a stable
  // CDN-cached 200 instead of a 307 → short-lived signed URL.
  const schemaImage = image ? buildCMSImageURL(image, { width: 1200 }) : undefined

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description:
      post.seoDescription ?? buildMetaDescription(post.description),
    image: schemaImage ? [schemaImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: authorSchema,
    articleSection: post.category?.title,
    publisher: {
      "@type": "Organization",
      name: "Railway",
      logo: {
        "@type": "ImageObject",
        url: "https://railway.com/brand/logo-dark.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  }
}

export const generateBreadcrumbSchema = (
  post: BlogPost,
  url: string,
  baseUrl = "https://blog.railway.com"
): object => {
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseUrl,
    },
  ]

  if (post.category) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: post.category.title,
      item: `${baseUrl}${getCategoryPath(post.category)}`,
    })
  }

  items.push({
    "@type": "ListItem",
    position: items.length + 1,
    name: post.title,
    item: url,
  })

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  }
}

export const generateFAQSchema = (faqs: FAQItem[]): object | null => {
  if (faqs.length === 0) return null

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export const HiddenTableOfContents: React.FC<{
  items: TableOfContentsItem[]
}> = ({ items }) => {
  if (items.length === 0) return null

  return (
    <nav
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        borderWidth: 0,
      }}
      aria-label="Table of Contents"
    >
      <h2>Table of Contents</h2>
      <ol>
        {items.map((item) => (
          <li
            key={item.id}
            style={{ marginLeft: `${(item.level - 1) * 1.5}rem` }}
          >
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
