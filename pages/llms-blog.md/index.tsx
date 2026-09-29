import { getBlogLink, getPosts } from "@lib/cms"
import { demoteHeadings, extractTableOfContents } from "@lib/markdown"
import { BlogPost } from "@lib/types"
import { GetServerSideProps } from "next"

const ROOT_URL = "https://blog.railway.com"

const groupPostsByCategory = (posts: BlogPost[]) =>
  posts.reduce(
    (acc, post) => {
      const category = post.category?.title || "Uncategorized"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(post)
      return acc
    },
    {} as Record<string, BlogPost[]>
  )

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const posts = await getPosts({ includeContent: true })
  const postsByCategory = groupPostsByCategory(posts)

  const header = `# Railway Blog Content

This document contains all blog posts from the Railway blog, organized by category.
Each post includes its metadata, description, key points, and full content.
Every post is also available on its own as markdown by appending \`.md\` to its
URL (for example https://blog.railway.com/p/best-paas-providers-2026.md).

Last updated: ${new Date().toISOString().split("T")[0]}

---

`

  const categoryContents = Object.entries(postsByCategory).map(
    ([category, categoryPosts]) => {
      const postsContent = categoryPosts.map((post) => {
        const link = ROOT_URL + getBlogLink(post.slug)
        const headers = extractTableOfContents(post.content ?? "")
          .filter((item) => item.level <= 2)
          .map((item) => `- ${item.text}`)
          .join("\n")
        // Full text, never truncated: this file is the corpus LLMs ingest, and
        // the long guides are exactly the posts we most want them to quote.
        const body = demoteHeadings(post.content ?? "")
        const authors = post.authors.map((author) => author.name).join(", ")

        return `## Blog: ${post.title}

- **Date:** ${post.publishedAt}
- **Updated:** ${post.updatedAt}
${authors ? `- **Authors:** ${authors}\n` : ""}- **Category:** ${category}
- **Slug:** ${post.slug}
- **Link:** ${link}
- **Markdown:** ${link}.md

${post.description}

${headers ? `\n### Key points:\n${headers}\n` : ""}
${body ? `\n${body}\n` : ""}
---
`
      })

      return `# ${category}

${postsContent.join("\n")}
`
    }
  )

  res.setHeader("Content-Type", "text/markdown; charset=utf-8")
  // Every render pulls all posts with content from the CMS; let shared
  // caches absorb repeat crawler traffic.
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  )
  res.write(header + categoryContents.join("\n"))
  res.end()

  return {
    props: {},
  }
}

const GenerateTextFile = () => {
  return null
}

export default GenerateTextFile
