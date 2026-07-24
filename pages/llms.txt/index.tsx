import { getBlogLink, getPosts } from "@lib/cms"
import { BlogPost } from "@lib/types"
import { GetServerSideProps } from "next"

const ROOT_URL = "https://blog.railway.com"

const SUMMARY =
  "Blog posts from the Railway team: deployment tutorials, deep engineering " +
  "adventures, product updates, and how the team works and builds Railway."

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
  const posts = await getPosts()
  const postsByCategory = groupPostsByCategory(posts)

  const header = `# Railway Blog

> ${SUMMARY}

The full text of every post is available in a single file at
${ROOT_URL}/llms-blog.md. An RSS feed of featured posts and guides is
available at ${ROOT_URL}/rss.xml.

`

  const categoryContents = Object.entries(postsByCategory).map(
    ([category, categoryPosts]) => {
      const links = categoryPosts.map((post) => {
        const link = ROOT_URL + getBlogLink(post.slug)
        return post.description
          ? `- [${post.title}](${link}): ${post.description}`
          : `- [${post.title}](${link})`
      })

      return `## ${category}

${links.join("\n")}
`
    }
  )

  res.setHeader("Content-Type", "text/plain; charset=utf-8")
  // Every render lists all posts from the CMS; let shared caches absorb
  // repeat crawler traffic.
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
