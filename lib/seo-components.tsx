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
    description: post.seoDescription ?? post.description,
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
