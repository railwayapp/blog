import { GetServerSideProps } from "next"
import { getDatabase, getBlogLink, getBlocks } from "@lib/notion"

const ROOT_URL = "https://blog.railway.com"

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const posts = await getDatabase(process.env.POSTS_TABLE_ID)
  
  // Group posts by category
  const postsByCategory = posts.reduce((acc, post) => {
    const category = post.properties.Category.select?.name || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(post)
    return acc
  }, {} as Record<string, typeof posts>)

  // Create header section
  const header = `# Railway Blog Content

This document contains all blog posts from the Railway blog, organized by category.
Each post includes its metadata, description, and key points from the content.

Last updated: ${new Date().toISOString().split('T')[0]}

---

`

  // Create content string with all blog posts
  const categoryContents = await Promise.all(
    Object.entries(postsByCategory).map(async ([category, categoryPosts]) => {
      const postsContent = await Promise.all(categoryPosts.map(async post => {
        const title = post.properties.Page.title[0]?.plain_text || 'Untitled'
        const slug = post.properties.Slug.rich_text[0]?.plain_text || ''
        const date = post.properties.Date.date?.start || ''
        const description = post.properties.Description.rich_text[0]?.plain_text || ''
        const link = ROOT_URL + getBlogLink(slug)
        
        // Get the content blocks
        const blocks = await getBlocks(post.id)
        const headers = blocks
          .filter(block => block.type === 'heading_1' || block.type === 'heading_2')
          .map(block => {
            const text = block[block.type].text[0]?.plain_text || ''
            return `- ${text}`
          })
          .join('\n')

        return `## Blog: ${title}

- **Date:** ${date}
- **Slug:** ${slug}
- **Link:** ${link}

${description}

${headers ? `\n### Key points:\n${headers}\n` : ''}

---
`
      }))

      return `# ${category}

${postsContent.join('\n')}
`
    })
  )

  // Set headers and return content
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
  res.setHeader('Content-Encoding', 'utf-8')
  res.write(header + categoryContents.join('\n'))
  res.end()

  return {
    props: {}
  }
}

// @ts-ignore: Default export to prevent next.js errors
const GenerateTextFile = () => {
  return null
}

export default GenerateTextFile
