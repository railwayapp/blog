import { getCategoryPath } from "@lib/cms"
import {
  extractFAQs,
  extractTableOfContents,
  FAQItem,
  TableOfContentsItem,
} from "@lib/markdown"
import { BlogPost } from "@lib/types"
import React from "react"

export { extractFAQs, extractTableOfContents }
export type { FAQItem, TableOfContentsItem }

const META_DESCRIPTION_MAX = 160
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
      ? { "@type": "Person", name: post.authors[0].name }
      : post.authors.length > 1
        ? post.authors.map((author) => ({
            "@type": "Person",
            name: author.name,
          }))
        : undefined

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description:
      post.seoDescription ?? buildMetaDescription(post.description),
    image: image ? [image] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: authorSchema,
    publisher: {
      "@type": "Organization",
      name: "Railway",
      logo: {
        "@type": "ImageObject",
        url: "https://blog.railway.com/railway.svg",
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
