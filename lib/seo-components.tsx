import React from "react"
import { Block } from "@notionhq/client/build/src/api-types"
import { PostProps } from "@lib/types"

export interface TableOfContentsItem {
  id: string
  text: string
  level: number
}

export interface FAQItem {
  question: string
  answer: string
}

const extractPlainText = (richText: any[]): string => {
  if (!richText || !Array.isArray(richText)) return ""
  return richText.map((t) => t.plain_text || "").join("")
}

const convertHeadingToId = (heading: any[]): string => {
  if (!heading || heading.length === 0) return ""
  return heading[0].plain_text
    .toLowerCase()
    .replace(/\s/g, "-")
    .replace(/[?!:]/g, "")
}

export const extractTableOfContents = (blocks: Block[]): TableOfContentsItem[] => {
  const toc: TableOfContentsItem[] = []

  const processBlock = (block: Block | any) => {
    const blockType = block.type
    const blockData = block[blockType]

    if (blockType === "heading_1" || blockType === "heading_2" || blockType === "heading_3") {
      const text = extractPlainText(blockData?.text || [])
      if (text) {
        const id = convertHeadingToId(blockData?.text || [])
        const level = blockType === "heading_1" ? 1 : blockType === "heading_2" ? 2 : 3
        toc.push({ id, text, level })
      }
    }

    if (blockData?.children) {
      blockData.children.forEach((child: Block | any) => processBlock(child))
    }
    if (block.column_list?.children) {
      block.column_list.children.forEach((child: Block | any) => processBlock(child))
    }
    if (block.column?.column) {
      block.column.column.forEach((child: Block | any) => processBlock(child))
    }
  }

  blocks.forEach(processBlock)
  return toc
}

export const extractFAQs = (blocks: Block[]): FAQItem[] => {
  const faqs: FAQItem[] = []
  let currentQuestion: string | null = null

  const processBlock = (block: Block | any) => {
    const blockType = block.type
    const blockData = block[blockType]

    if (blockType === "callout") {
      const text = extractPlainText(blockData?.text || [])
      if (text) {
        if (text.trim().endsWith("?")) {
          currentQuestion = text.trim()
        } else if (currentQuestion) {
          faqs.push({ question: currentQuestion, answer: text.trim() })
          currentQuestion = null
        }
      }
    }

    if (blockType === "heading_2" || blockType === "heading_3") {
      const text = extractPlainText(blockData?.text || [])
      if (text && text.trim().endsWith("?")) {
        currentQuestion = text.trim()
      }
    }

    if (blockType === "paragraph" && currentQuestion) {
      const text = extractPlainText(blockData?.text || [])
      if (text.trim()) {
        faqs.push({ question: currentQuestion, answer: text.trim() })
        currentQuestion = null
      }
    }

    if (blockData?.children) {
      blockData.children.forEach((child: Block | any) => processBlock(child))
    }
    if (block.column_list?.children) {
      block.column_list.children.forEach((child: Block | any) => processBlock(child))
    }
    if (block.column?.column) {
      block.column.column.forEach((child: Block | any) => processBlock(child))
    }
  }

  blocks.forEach(processBlock)
  return faqs
}

export const generateBlogPostSchema = (post: PostProps, url: string): object => {
  const title = extractPlainText(post.properties.Page.title)
  const description = extractPlainText(post.properties.Description.rich_text)
  const author = post.properties.Authors.people[0]
  const datePublished = post.properties.Date.date?.start
  const image = post.properties.Image?.url

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    image: image ? [image] : undefined,
    datePublished: datePublished,
    dateModified: datePublished,
    author: author
      ? {
          "@type": "Person",
          name: author.name,
        }
      : undefined,
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
  post: PostProps,
  url: string,
  baseUrl: string = "https://blog.railway.com"
): object => {
  const title = extractPlainText(post.properties.Page.title)
  const category = post.properties.Category?.select?.name

  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseUrl,
    },
  ]

  if (category) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: category,
      item: `${baseUrl}/${category.toLowerCase()}`,
    })
  }

  items.push({
    "@type": "ListItem",
    position: items.length + 1,
    name: title,
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

export const HiddenTableOfContents: React.FC<{ items: TableOfContentsItem[] }> = ({ items }) => {
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
          <li key={item.id} style={{ marginLeft: `${(item.level - 1) * 1.5}rem` }}>
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

