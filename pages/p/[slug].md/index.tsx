import { getPostBySlug } from "@lib/cms"
import { GetServerSideProps } from "next"

const ROOT_URL = "https://blog.railway.com"

/**
 * Markdown twin of /p/{slug}. Serves the post's full content as
 * text/markdown with YAML front-matter so LLMs and markdown-preferring
 * clients get the same payload the HTML page serves.
 */
export const getServerSideProps: GetServerSideProps = async ({
  params,
  res,
}) => {
  const slug = typeof params?.slug === "string" ? params.slug : null

  if (!slug) {
    res.statusCode = 404
    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.end("Post not found")
    return { props: {} }
  }

  const post = await getPostBySlug(slug)

  if (!post) {
    res.statusCode = 404
    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=60, stale-while-revalidate=300"
    )
    res.end("Post not found")
    return { props: {} }
  }

  const url = `${ROOT_URL}/p/${post.slug}`
  const authors = post.authors.map((a) => a.name).filter(Boolean)

  const yamlQuote = (value: string) =>
    `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`

  const parts: string[] = []

  parts.push("---")
  parts.push(`title: ${yamlQuote(post.title)}`)
  if (post.description) {
    parts.push(`description: ${yamlQuote(post.description)}`)
  }
  parts.push(`date: ${post.publishedAt}`)
  if (authors.length > 0) {
    parts.push(`authors: [${authors.map(yamlQuote).join(", ")}]`)
  }
  if (post.category) {
    parts.push(`category: ${yamlQuote(post.category.title)}`)
  }
  parts.push(`url: ${url}`)
  parts.push("---")
  parts.push("")
  parts.push(`# ${post.title}`)
  parts.push("")

  if (post.content) {
    parts.push(post.content)
    parts.push("")
  }

  parts.push(`---`)
  parts.push("")
  parts.push(`Open this post in a browser: ${url}`)
  parts.push("")

  res.setHeader("Content-Type", "text/markdown; charset=utf-8")
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
  )
  res.write(parts.join("\n"))
  res.end()

  return { props: {} }
}

const MarkdownTwin = () => null

export default MarkdownTwin
