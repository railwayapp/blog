import {
  getBlogLink,
  getCategories,
  getCategoryPath,
  getPosts,
} from "@lib/cms"
import { BlogPost } from "@lib/types"
import { GetServerSideProps } from "next"
import { getServerSideSitemap } from "next-sitemap"

const ROOT_URL = "https://blog.railway.com"

/** Return the most recent updatedAt ISO string across the given posts. */
const latestUpdate = (posts: BlogPost[]): string | undefined => {
  if (posts.length === 0) return undefined
  return posts.reduce((latest, post) => {
    const d = post.updatedAt || post.publishedAt
    return d > latest ? d : latest
  }, posts[0].updatedAt || posts[0].publishedAt)
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=900, stale-while-revalidate=3600"
  )

  const [posts, categories] = await Promise.all([getPosts(), getCategories()])

  const postPaths = posts.map((post) => ({
    loc: ROOT_URL + getBlogLink(post.slug),
    lastmod: new Date(post.updatedAt || post.publishedAt).toISOString(),
  }))

  // Use the most recent post update for each category instead of new Date()
  const categoryPaths = categories.map((category) => {
    const categoryPosts = posts.filter(
      (post) => post.category?.slug === category.slug
    )
    const lastmod = latestUpdate(categoryPosts)
    return {
      loc: ROOT_URL + getCategoryPath(category),
      ...(lastmod && { lastmod: new Date(lastmod).toISOString() }),
    }
  })

  // Homepage lastmod = most recent post update across all posts
  const homepageLastmod = latestUpdate(posts)

  const fields = [
    {
      loc: ROOT_URL,
      ...(homepageLastmod && {
        lastmod: new Date(homepageLastmod).toISOString(),
      }),
    },
    ...categoryPaths,
    ...postPaths,
  ]

  return getServerSideSitemap(ctx, fields)
}

const SitemapPage = () => {
  return null
}

export default SitemapPage
