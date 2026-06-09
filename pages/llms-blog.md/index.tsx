import { getBlogLink, getPosts } from "@lib/cms"
import { extractTableOfContents } from "@lib/markdown"
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
Each post includes its metadata, description, and key points from the content.

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

        return `## Blog: ${post.title}

- **Date:** ${post.publishedAt}
- **Slug:** ${post.slug}
- **Link:** ${link}

${post.description}

${headers ? `\n### Key points:\n${headers}\n` : ""}

---
`
      })

      return `# ${category}

${postsContent.join("\n")}
`
    }
  )

  res.setHeader("Content-Type", "text/markdown; charset=utf-8")
  res.setHeader("Content-Encoding", "utf-8")
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
