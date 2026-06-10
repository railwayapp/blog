import { MarkdownContent } from "@components/MarkdownContent"
import { getPosts } from "@lib/cms"
import { BlogPost } from "@lib/types"
import { Feed } from "feed"
import { writeFileSync } from "fs"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

const baseUrl = "https://blog.railway.com"

const author = {
  name: "Railway",
  email: "team@railway.com",
  link: "https://railway.com",
}

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const renderPostContent = (post: BlogPost) => {
  const authors = post.authors.map((item) => item.name).join(" & ")
  const image = post.featuredImage ?? post.socialImage
  let html = ""

  if (authors) {
    html += `<p style="font-style: italic; margin-bottom: 1.5rem; color: #6b7280;">${
      post.authors.length > 1 ? "Authors" : "Author"
    }: ${escapeHtml(authors)}</p>`
  }

  if (image) {
    html += `<figure style="margin: 0 0 2rem 0;">
      <img src="${escapeHtml(image.url)}" alt="${escapeHtml(
        image.alt || post.title
      )}" style="width: 100%; height: auto; border-radius: 0.5rem;" />
    </figure>`
  }

  html += renderToStaticMarkup(
    React.createElement(MarkdownContent, {
      content: post.content ?? "",
      mode: "rss",
    })
  )

  return html
}

export const generateRssFeed = async () => {
  if (process.env.NODE_ENV === "development") return

  const feed = new Feed({
    title: "Railway Blog",
    description:
      "A series of posts ranging from deployment tutorials to deep engineering adventures to how the team works and builds Railway.",
    id: baseUrl,
    link: baseUrl,
    language: "en",
    feedLinks: {
      rss2: `${baseUrl}/rss.xml`,
    },
    author,
    copyright: `Copyright (c) ${new Date().getFullYear()} Railway Corp.`,
  })

  // One paginated query with content included, instead of a follow-up
  // request per post (the feed holds 100+ posts).
  const includedPosts: BlogPost[] = await getPosts({
    includeContent: true,
    where: {
      or: [
        { featured: { equals: true } },
        { "category.slug": { equals: "guide" } },
      ],
    },
  })

  for (const post of includedPosts) {
    const link = `${baseUrl}/p/${post.slug}`
    const image = post.featuredImage?.url ?? post.socialImage?.url

    try {
      feed.addItem({
        title: post.title,
        description: post.description,
        content: renderPostContent(post),
        id: link,
        link,
        date: new Date(post.publishedAt),
        image,
        category: [
          { name: "railway" },
          { name: "cloud" },
        ],
      })
    } catch (error) {
      console.error(`Error processing post ${post.id}:`, error)
      feed.addItem({
        title: post.title,
        description: post.description,
        id: link,
        link,
        date: new Date(post.publishedAt),
        image,
        category: [
          { name: "railway" },
          { name: "cloud" },
        ],
      })
    }
  }

  writeFileSync("public/rss.xml", feed.rss2())
}
